import Assessment from '../models/Assessment.js';
import AssessmentQuestion from '../models/AssessmentQuestion.js';
import StudentSkill from '../models/StudentSkill.js';
import Skill from '../models/Skill.js';
import { analyzeAssessmentResults } from '../services/aiService.js';

// @desc    Start a diagnostic assessment
// @route   POST /api/assessments/start
// @access  Private
export const startAssessment = async (req, res, next) => {
    try {
        // Check if there is an in-progress assessment. If so, return it.
        let activeAssessment = await Assessment.findOne({ userId: req.user._id, status: 'In-Progress' })
            .populate({
                path: 'questions.questionId',
                select: 'questionText options difficulty topicId estimatedTimeSeconds'
            });

        if (activeAssessment) {
            return res.json({
                success: true,
                message: 'Resuming active assessment',
                data: activeAssessment
            });
        }

        // Generate diagnostic questions
        // Select e.g. 2 questions from key skills
        const questions = await AssessmentQuestion.find();
        if (questions.length === 0) {
            return res.status(404).json({ success: false, message: 'No assessment questions available in database yet. Please configure questions as Admin first.' });
        }

        // Select questions (limit to 10 for standard tests)
        const selectedQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 10);

        const assessmentQuestions = selectedQuestions.map(q => ({
            questionId: q._id,
            studentAnswerIndex: null,
            isCorrect: false,
            timeTakenSeconds: 0,
            attemptsCount: 0
        }));

        const assessment = await Assessment.create({
            userId: req.user._id,
            questions: assessmentQuestions,
            totalQuestions: assessmentQuestions.length,
            status: 'In-Progress'
        });

        const populatedAssessment = await Assessment.findById(assessment._id)
            .populate({
                path: 'questions.questionId',
                select: 'questionText options difficulty topicId estimatedTimeSeconds'
            });

        res.status(201).json({
            success: true,
            message: 'Assessment started',
            data: populatedAssessment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit answer for a question
// @route   POST /api/assessments/:id/answer
// @access  Private
export const submitAnswer = async (req, res, next) => {
    const { questionId, studentAnswerIndex, timeTakenSeconds } = req.body;

    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        if (assessment.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Assessment already completed' });
        }

        // Find question within assessment
        const qItem = assessment.questions.find(q => q.questionId.toString() === questionId);
        if (!qItem) {
            return res.status(400).json({ success: false, message: 'Question not part of this assessment' });
        }

        // Verify answer correctness against master database question
        const originalQuestion = await AssessmentQuestion.findById(questionId);
        if (!originalQuestion) {
            return res.status(404).json({ success: false, message: 'Original question not found' });
        }

        const isCorrect = originalQuestion.correctOptionIndex === Number(studentAnswerIndex);

        qItem.studentAnswerIndex = Number(studentAnswerIndex);
        qItem.isCorrect = isCorrect;
        qItem.timeTakenSeconds = Number(timeTakenSeconds) || 0;
        qItem.attemptsCount += 1;

        await assessment.save();

        res.json({
            success: true,
            message: 'Answer submitted successfully',
            data: {
                isCorrect,
                correctOptionIndex: originalQuestion.correctOptionIndex,
                explanation: originalQuestion.explanation
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Complete and compile diagnostic assessment
// @route   POST /api/assessments/:id/complete
// @access  Private
export const completeAssessment = async (req, res, next) => {
    try {
        const assessment = await Assessment.findById(req.params.id).populate('questions.questionId');
        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        if (assessment.status === 'Completed') {
            return res.json({
                success: true,
                message: 'Assessment already completed',
                data: assessment
            });
        }

        // Compute score
        let correctCount = 0;
        const skillPerformanceMap = {}; // Maps skillId -> { correct: X, total: Y }

        for (const q of assessment.questions) {
            if (q.isCorrect) {
                correctCount += 1;
            }

            const skillId = q.questionId.topicId.toString();
            if (!skillPerformanceMap[skillId]) {
                skillPerformanceMap[skillId] = { correct: 0, total: 0 };
            }
            skillPerformanceMap[skillId].total += 1;
            if (q.isCorrect) {
                skillPerformanceMap[skillId].correct += 1;
            }
        }

        assessment.score = correctCount;
        assessment.status = 'Completed';
        assessment.completedAt = new Date();

        // Initialize/update StudentSkill records based on diagnostic performance
        for (const skillId of Object.keys(skillPerformanceMap)) {
            const stats = skillPerformanceMap[skillId];
            const accuracy = Math.round((stats.correct / stats.total) * 100);

            let studentSkill = await StudentSkill.findOne({ userId: req.user._id, skillId });
            if (!studentSkill) {
                studentSkill = new StudentSkill({
                    userId: req.user._id,
                    skillId,
                    solvedCount: stats.correct,
                    attemptedCount: stats.total,
                    failedCount: stats.total - stats.correct,
                    accuracy,
                    masteryScore: accuracy // Diagnostic test accuracy directly seeds initial mastery
                });
            } else {
                studentSkill.attemptedCount += stats.total;
                studentSkill.solvedCount += stats.correct;
                studentSkill.failedCount += (stats.total - stats.correct);
                if (studentSkill.attemptedCount > 0) {
                    studentSkill.accuracy = Math.round((studentSkill.solvedCount / studentSkill.attemptedCount) * 100);
                }
                studentSkill.masteryScore = Math.round((studentSkill.masteryScore + accuracy) / 2);
            }
            await studentSkill.save();
        }

        // Generate AI Summary of performance
        const populatedAssessmentLogs = assessment.questions.map(q => ({
            topicName: q.questionId.patternName || 'General',
            difficulty: q.questionId.difficulty,
            isCorrect: q.isCorrect
        }));

        assessment.aiSummary = await analyzeAssessmentResults(populatedAssessmentLogs);
        await assessment.save();

        res.json({
            success: true,
            message: 'Assessment completed and compiled',
            data: assessment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get assessment history
// @route   GET /api/assessments/history
// @access  Private
export const getAssessmentHistory = async (req, res, next) => {
    try {
        const history = await Assessment.find({ userId: req.user._id, status: 'Completed' })
            .sort({ completedAt: -1 });

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get details of a specific assessment
// @route   GET /api/assessments/:id
// @access  Private
export const getAssessmentDetail = async (req, res, next) => {
    try {
        const assessment = await Assessment.findById(req.params.id)
            .populate('questions.questionId');

        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        res.json({
            success: true,
            data: assessment
        });
    } catch (error) {
        next(error);
    }
};
