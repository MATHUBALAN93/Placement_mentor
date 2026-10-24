import User from '../models/User.js';
import StudentSkill from '../models/StudentSkill.js';
import ProblemAttempt from '../models/ProblemAttempt.js';
import InterviewSession from '../models/InterviewSession.js';
import Assessment from '../models/Assessment.js';
import { calculateReadinessScore } from '../services/readinessService.js';
import { getAdaptiveRecommendations } from '../services/recommendationService.js';

// @desc    Get dashboard telemetry payload for student dashboard main index
// @route   GET /api/users/dashboard
// @access  Private
export const getStudentDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // 1. Core KPIs
        const problemsSolved = await ProblemAttempt.countDocuments({ userId, status: 'Solved' });
        const totalAttempts = await ProblemAttempt.countDocuments({ userId });

        let accuracy = 0;
        if (totalAttempts > 0) {
            accuracy = Math.round((problemsSolved / totalAttempts) * 100);
        }

        const mockInterviewsCount = await InterviewSession.countDocuments({ userId, status: 'Completed' });

        // 2. Readiness Ring calculation
        const readiness = await calculateReadinessScore(userId);

        // 3. Weakest Skills (top 3 only)
        const weakSkills = await StudentSkill.find({ userId })
            .populate('skillId', 'name category')
            .sort({ masteryScore: 1 })
            .limit(3);

        // 4. Continue learning recommendations
        const continueActions = [];

        // Check if diagnostic test is completed. If not, diagnostic test is top action!
        const completedAssessments = await Assessment.countDocuments({ userId, status: 'Completed' });
        if (completedAssessments === 0) {
            continueActions.push({
                actionName: 'Complete your Initial Diagnostic Test',
                description: 'Establish your baseline skill profile in 10 minutes.',
                ctaText: 'Start Assessment',
                route: '/assessments/test'
            });
        }

        // Add adaptive problems recommendations
        const recommendedProblems = await getAdaptiveRecommendations(userId, 2);
        recommendedProblems.forEach(prob => {
            continueActions.push({
                actionName: `Practice "${prob.title}"`,
                description: `Solve on ${prob.platform} to strengthen your patterns.`,
                ctaText: 'Solve Problem',
                route: `/problems/${prob._id}`
            });
        });

        if (continueActions.length < 3) {
            // Add interview reminder
            continueActions.push({
                actionName: 'Start a Mock Interview',
                description: 'Simulate a real coding round with your custom AI tutor.',
                ctaText: 'Start Mock Interview',
                route: '/interviews/mock'
            });
        }

        // 5. Recent activity (last 5 attempts)
        const recentActivity = await ProblemAttempt.find({ userId })
            .populate('problemId', 'title platform difficulty')
            .sort({ createdAt: -1 })
            .limit(5);

        // 6. Streak calendars representation
        const user = await User.findById(userId).select('streak');

        res.json({
            success: true,
            data: {
                kpis: {
                    problemsSolved,
                    accuracy,
                    streak: user.streak?.current || 0,
                    mockInterviewsCompleted: mockInterviewsCount
                },
                readiness,
                weakestSkills: weakSkills.map(ws => ({
                    skillName: ws.skillId?.name || 'General',
                    masteryScore: ws.masteryScore,
                    category: ws.skillId?.category
                })),
                continueActions: continueActions.slice(0, 3),
                recentActivity,
                streakLog: user.streak || { current: 0, max: 0, activeDates: [] }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update and verify student streak counter
// @route   POST /api/users/streak/update
// @access  Private
export const updateStreak = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const todayStr = new Date().toISOString().split('T')[0]; // Format yyyy-mm-dd
        const streak = user.streak || { current: 0, max: 0, activeDates: [] };

        if (!streak.activeDates.includes(todayStr)) {
            streak.activeDates.push(todayStr);

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (streak.activeDates.includes(yesterdayStr) || streak.current === 0) {
                streak.current += 1;
            } else {
                streak.current = 1; // Streak broken/re-started
            }

            if (streak.current > streak.max) {
                streak.max = streak.current;
            }

            streak.lastActive = new Date();
            user.streak = streak;
            await user.save();
        }

        res.json({
            success: true,
            message: 'Streak updated successfully',
            data: user.streak
        });
    } catch (error) {
        next(error);
    }
};
