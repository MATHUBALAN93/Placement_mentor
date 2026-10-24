import Problem from '../models/Problem.js';
import ProblemAttempt from '../models/ProblemAttempt.js';
import StudentSkill from '../models/StudentSkill.js';
import Skill from '../models/Skill.js';

// @desc    Get all problems (supports search, sort, filter)
// @route   GET /api/problems
// @access  Private
export const getAllProblems = async (req, res, next) => {
    const { search, platform, difficulty, topic, pattern, company, status, sort } = req.query;

    try {
        let query = { isActive: true };

        // Search by title
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Filters
        if (platform) query.platform = platform;
        if (difficulty) query.difficulty = difficulty;
        if (topic) query.topic = topic;
        if (pattern) query.patterns = pattern;
        if (company) query.companies = company;

        // Filter by solved status
        if (status) {
            const attempts = await ProblemAttempt.find({ userId: req.user._id });
            const solvedIds = attempts
                .filter(a => a.status === 'Solved')
                .map(a => a.problemId.toString());

            const attemptedIds = attempts.map(a => a.problemId.toString());

            if (status === 'Solved') {
                query._id = { $in: solvedIds };
            } else if (status === 'Unsolved') {
                const solvedUnique = [...new Set(solvedIds)];
                query._id = { $nin: solvedUnique };
            } else if (status === 'Attempted') {
                query._id = { $in: attemptedIds };
            }
        }

        // Build DB query
        let dbQuery = Problem.find(query).populate('topic', 'name category');

        // Sorting
        if (sort) {
            if (sort === 'DifficultyAsc') {
                // Handled in JS sorting or customized mapping since difficulty is a string enum
            } else if (sort === 'RecentlyAdded') {
                dbQuery = dbQuery.sort({ createdAt: -1 });
            }
        }

        let problems = await dbQuery;

        // Custom sorting for difficulty since it's an enum: Easy -> Medium -> Hard
        if (sort === 'DifficultyAsc') {
            const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
            problems = problems.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
        } else if (sort === 'DifficultyDesc') {
            const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
            problems = problems.sort((a, b) => diffOrder[b.difficulty] - diffOrder[a.difficulty]);
        }

        res.json({
            success: true,
            count: problems.length,
            data: problems
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single problem detail
// @route   GET /api/problems/:id
// @access  Private
export const getProblemDetail = async (req, res, next) => {
    try {
        const problem = await Problem.findById(req.params.id).populate('topic', 'name category');
        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }

        // Get student attempts for this problem
        const attempts = await ProblemAttempt.find({
            userId: req.user._id,
            problemId: problem._id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                problem,
                attempts
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Log a problem solving attempt
// @route   POST /api/attempts
// @access  Private
export const logProblemAttempt = async (req, res, next) => {
    const { problemId, status, language, timeTaken, hintsUsed, solutionViewed, code, confidence, notes } = req.body;

    try {
        if (!problemId || !status) {
            return res.status(400).json({ success: false, message: 'Problem ID and status are required' });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }

        // Get count of previous attempts
        const previousAttempts = await ProblemAttempt.countDocuments({
            userId: req.user._id,
            problemId: problem._id
        });

        const attempt = await ProblemAttempt.create({
            userId: req.user._id,
            problemId,
            status,
            language,
            timeTaken: Number(timeTaken) || 0,
            attemptCount: previousAttempts + 1,
            hintsUsed: Number(hintsUsed) || 0,
            solutionViewed: !!solutionViewed,
            confidence: Number(confidence) || 3,
            notes,
            code
        });

        // Update StudentSkill representation
        await updateStudentSkillProgress(req.user._id, problem.topic, status, timeTaken, hintsUsed);

        res.status(201).json({
            success: true,
            message: 'Attempt logged successfully',
            data: attempt
        });
    } catch (error) {
        next(error);
    }
};

// Helper: Update a student's skill metrics when they make an attempt
const updateStudentSkillProgress = async (userId, skillId, status, timeTaken, hintsUsed) => {
    try {
        let studentSkill = await StudentSkill.findOne({ userId, skillId });

        if (!studentSkill) {
            studentSkill = new StudentSkill({
                userId,
                skillId,
                masteryScore: 0,
                accuracy: 0,
                solvedCount: 0,
                attemptedCount: 0,
                failedCount: 0,
                hintsUsedCount: 0,
                averageTimeTaken: 0
            });
        }

        studentSkill.attemptedCount += 1;
        if (status === 'Solved') {
            studentSkill.solvedCount += 1;
        } else if (status === 'Failed') {
            studentSkill.failedCount += 1;
        }

        if (hintsUsed) {
            studentSkill.hintsUsedCount += Number(hintsUsed);
        }

        // Calculate accuracy percentage
        if (studentSkill.attemptedCount > 0) {
            studentSkill.accuracy = Math.round((studentSkill.solvedCount / studentSkill.attemptedCount) * 100);
        }

        // Calculate rolling average time taken
        const t = Number(timeTaken) || 0;
        if (t > 0) {
            if (studentSkill.averageTimeTaken === 0) {
                studentSkill.averageTimeTaken = t;
            } else {
                studentSkill.averageTimeTaken = Math.round((studentSkill.averageTimeTaken * (studentSkill.attemptedCount - 1) + t) / studentSkill.attemptedCount);
            }
        }

        // Mastery Score derivation: e.g. solves, accuracy, penalty for hints
        let baseScore = studentSkill.accuracy * 0.7 + Math.min(studentSkill.solvedCount * 4, 30); // Max Solved weight is 30 points
        // Deduct simple penalties for high hints or high avg time
        const hintPenalty = Math.min(studentSkill.hintsUsedCount * 1.5, 15);
        let finalMastery = Math.max(0, Math.round(baseScore - hintPenalty));
        studentSkill.masteryScore = Math.min(finalMastery, 100);

        studentSkill.lastPracticed = new Date();
        await studentSkill.save();
    } catch (error) {
        console.error('Error updating student skill progress:', error.message);
    }
};
