import Problem from '../models/Problem.js';
import StudentSkill from '../models/StudentSkill.js';
import Skill from '../models/Skill.js';
import ProblemAttempt from '../models/ProblemAttempt.js';

// @desc    Determine adaptive next problems for student based on performance signals
// @route   Internal Service
export const getAdaptiveRecommendations = async (userId, limit = 3) => {
    try {
        // 1. Get user's skill data
        const studentSkills = await StudentSkill.find({ userId }).populate('skillId');

        // Find weaknesses (mastery score < 60)
        let weakSkills = studentSkills
            .filter(ss => ss.masteryScore < 60)
            .sort((a, b) => a.masteryScore - b.masteryScore); // Try the weakest first

        // If no explicit weak skills track, default to seeding with all core topic categories
        if (weakSkills.length === 0) {
            const allSkills = await Skill.find();
            // Select 3 random skills to suggest starting
            const randomSkills = allSkills.sort(() => 0.5 - Math.random()).slice(0, 3);

            const defaultRecommendations = [];
            for (const skill of randomSkills) {
                const problem = await Problem.findOne({ topic: skill._id, difficulty: 'Easy', isActive: true });
                if (problem) defaultRecommendations.push(problem);
            }
            return defaultRecommendations;
        }

        const recommendations = [];

        // 2. Loop through weaknesses to pick appropriate problems
        for (const ws of weakSkills) {
            if (recommendations.length >= limit) break;

            const skillId = ws.skillId._id;

            // Determine what difficulty to recommend
            let targetDifficulty = 'Easy';

            if (ws.accuracy >= 75 && ws.solvedCount >= 3) {
                targetDifficulty = 'Medium';
            }
            if (ws.accuracy >= 70 && targetDifficulty === 'Medium' && ws.solvedCount >= 8) {
                targetDifficulty = 'Hard';
            }

            // Check if they recently failed hard problems repeatedly
            const recentAttempts = await ProblemAttempt.find({ userId, problemId: { $in: await Problem.find({ topic: skillId }).select('_id') } })
                .sort({ createdAt: -1 })
                .limit(3);

            const failCount = recentAttempts.filter(a => a.status === 'Failed').length;
            if (failCount >= 2) {
                // Step down in difficulty
                targetDifficulty = targetDifficulty === 'Hard' ? 'Medium' : 'Easy';
            }

            // Find solved problem IDs to filter out
            const solvedAttempts = await ProblemAttempt.find({ userId, status: 'Solved' }).select('problemId');
            const solvedIds = solvedAttempts.map(a => a.problemId);

            // Find problems matching skill and difficulty that user hasn't solved yet
            const candidateList = await Problem.find({
                topic: skillId,
                difficulty: targetDifficulty,
                _id: { $nin: solvedIds },
                isActive: true
            }).limit(2);

            if (candidateList.length > 0) {
                recommendations.push(...candidateList);
            } else {
                // Fallback: If no unsolved candidate at target difficulty, grab any unsolved problem in that skill
                const fallbackList = await Problem.find({
                    topic: skillId,
                    _id: { $nin: solvedIds },
                    isActive: true
                }).limit(1);
                recommendations.push(...fallbackList);
            }
        }

        return recommendations.slice(0, limit);
    } catch (error) {
        console.error('Error generating adaptive recommendations:', error.message);
        return [];
    }
};

// @desc    Generate personalized daily timeboxed schedule
// @route   Internal Service
export const getDailySchedule = async (userId, availableHours = 2) => {
    try {
        const minsTotal = availableHours * 60;
        const schedule = [];
        let elapsedMins = 0;

        // Get recommendations
        const recommendedProblems = await getAdaptiveRecommendations(userId, 2);

        if (recommendedProblems.length > 0) {
            for (const prob of recommendedProblems) {
                const timeNeeded = prob.estimatedTime || 30;
                if (elapsedMins + timeNeeded <= minsTotal) {
                    schedule.push({
                        activity: `Solve problem "${prob.title}" on ${prob.platform}`,
                        duration: timeNeeded,
                        type: 'PRACTICE',
                        problemId: prob._id,
                        url: prob.externalUrl
                    });
                    elapsedMins += timeNeeded;
                }
            }
        }

        // Allocate remaining time to concept revision, mock interview, or aptitude
        const remainingMins = minsTotal - elapsedMins;
        if (remainingMins >= 30) {
            schedule.push({
                activity: 'Take a simulated 15-minute Mock Interview with AI Mentor',
                duration: 20,
                type: 'INTERVIEW'
            });
            elapsedMins += 20;

            const rest = minsTotal - elapsedMins;
            if (rest >= 15) {
                schedule.push({
                    activity: 'Review weak categories (graphs and trees revision)',
                    duration: rest,
                    type: 'REVISION'
                });
            }
        } else if (remainingMins > 0) {
            schedule.push({
                activity: 'Solve an aptitude MCQ mock test',
                duration: remainingMins,
                type: 'APTITUDE'
            });
        }

        return schedule;
    } catch (error) {
        console.error('Error generating daily schedule:', error.message);
        return [{ activity: 'Practice DSA problems', duration: availableHours * 60, type: 'PRACTICE' }];
    }
};
