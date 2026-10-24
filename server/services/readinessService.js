import StudentSkill from '../models/StudentSkill.js';
import InterviewSession from '../models/InterviewSession.js';
import Resume from '../models/Resume.js';
import ProblemAttempt from '../models/ProblemAttempt.js';

// @desc    Calculate Weighted Placement Readiness Score (0 to 100)
// @route   Internal Service
export const calculateReadinessScore = async (userId) => {
    try {
        // Default weights: 
        // DSA 25%, Programming Language 15%, SQL/DBMS 15%, CS Fundamentals 15%, Interview 15%, Resume 10%, Consistency 5%
        let dsaScore = 0;
        let languageScore = 0;
        let dbmsScore = 0;
        let csFundScore = 0;
        let interviewScore = 0;
        let resumeScore = 0;
        let consistencyScore = 0;

        // 1. Fetch user student skills
        const studentSkills = await StudentSkill.find({ userId }).populate('skillId');

        // Aggregate category scores
        const categoryAggregations = {
            DSA: { total: 0, count: 0 },
            LANGUAGE: { total: 0, count: 0 },
            CS_FUNDAMENTALS: { total: 0, count: 0 }
        };

        studentSkills.forEach(ss => {
            const cat = ss.skillId.category;
            if (categoryAggregations[cat] !== undefined) {
                categoryAggregations[cat].total += ss.masteryScore;
                categoryAggregations[cat].count += 1;
            }

            // SQL / DBMS fits CS Fundamentals or Custom category
            if (ss.skillId.name.toLowerCase() === 'sql' || ss.skillId.name.toLowerCase() === 'dbms') {
                dbmsScore = Math.max(dbmsScore, ss.masteryScore);
            }
        });

        if (categoryAggregations.DSA.count > 0) {
            dsaScore = Math.round(categoryAggregations.DSA.total / categoryAggregations.DSA.count);
        }
        if (categoryAggregations.LANGUAGE.count > 0) {
            languageScore = Math.round(categoryAggregations.LANGUAGE.total / categoryAggregations.LANGUAGE.count);
        }
        if (categoryAggregations.CS_FUNDAMENTALS.count > 0) {
            csFundScore = Math.round(categoryAggregations.CS_FUNDAMENTALS.total / categoryAggregations.CS_FUNDAMENTALS.count);
        }

        // 2. Fetch mock interview score (average of completed sessions)
        const completedInterviews = await InterviewSession.find({ userId, status: 'Completed' });
        if (completedInterviews.length > 0) {
            const sum = completedInterviews.reduce((acc, curr) => acc + curr.evaluation.overallScore, 0);
            interviewScore = Math.round(sum / completedInterviews.length);
        }

        // 3. Fetch latest resume score
        const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
        if (latestResume) {
            resumeScore = latestResume.evaluation.overallScore;
        }

        // 4. Calculate consistency score (streak count multiplier)
        const attempts = await ProblemAttempt.find({ userId }).sort({ createdAt: -1 });
        if (attempts.length > 0) {
            // Find count of active days in last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const uniqueDaysCount = await ProblemAttempt.distinct('createdAt', {
                userId,
                createdAt: { $gte: thirtyDaysAgo }
            });

            // Calculate simple index
            consistencyScore = Math.min(100, uniqueDaysCount.length * 10);
        }

        // Compute overall weighted percentage
        const finalScore = Math.round(
            (dsaScore * 0.25) +
            (languageScore * 0.15) +
            (dbmsScore * 0.15) +
            (csFundScore * 0.15) +
            (interviewScore * 0.15) +
            (resumeScore * 0.10) +
            (consistencyScore * 0.05)
        );

        // Formulate a plain-language summary comment based on findings
        let statusText = "Ready to start practicing! Take your diagnostic assessment to define your initial preparation score.";
        if (finalScore > 0) {
            if (finalScore >= 80) {
                statusText = `Excellent progress! You're ${finalScore}% placement ready. Focus on advanced mock interviews to polish soft skills.`;
            } else if (finalScore >= 55) {
                // Recommend focusing on lowest score
                let weakness = "Graphs/DP";
                if (dbmsScore < 60) weakness = "SQL/DBMS foundations";
                else if (interviewScore < 60) weakness = "verbal communication";
                else if (resumeScore < 60) weakness = "formatting your projects";

                statusText = `Good standing - you're ${finalScore}% ready. Try focusing on ${weakness} next to pull your score up.`;
            } else {
                statusText = `Keep pushing! You're ${finalScore}% ready. Begin by completing easy problems in Arrays, Hashing, and Programming syntax.`;
            }
        }

        return {
            score: finalScore,
            statusLine: statusText,
            breakdown: {
                dsa: dsaScore,
                language: languageScore,
                dbms: dbmsScore,
                csFundamentals: csFundScore,
                interview: interviewScore,
                resume: resumeScore,
                consistency: consistencyScore
            }
        };
    } catch (error) {
        console.error('Error calculating readiness score:', error.message);
        return { score: 0, statusLine: "Preparation offline.", breakdown: {} };
    }
};
