import Company from '../models/Company.js';
import StudentSkill from '../models/StudentSkill.js';
import Problem from '../models/Problem.js';
import ProblemAttempt from '../models/ProblemAttempt.js';

// @desc    Get all active companies
// @route   GET /api/companies
// @access  Private
export const getAllCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find({ isActive: true }).select('name logo description industry roles');
        res.json({
            success: true,
            data: companies
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get details and preparation info for a specific company
// @route   GET /api/companies/:id
// @access  Private
export const getCompanyPreparationDetails = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id)
            .populate('skills', 'name category')
            .populate('preparationData.topics.topicId', 'name category');

        if (!company) {
            return res.status(404).json({ success: false, message: 'Company details not found' });
        }

        // Calculate user's specific readiness matching this company
        // Clustered around the skills tagged to the company
        let matchPercentage = 0;
        const requiredSkillsIds = company.skills.map(s => s._id.toString());

        if (requiredSkillsIds.length > 0) {
            const studentSkills = await StudentSkill.find({
                userId: req.user._id,
                skillId: { $in: requiredSkillsIds }
            });

            let totalMastery = 0;
            studentSkills.forEach(ss => {
                totalMastery += ss.masteryScore;
            });

            // Simple average: divide total mastery by required skills count
            matchPercentage = Math.round(totalMastery / requiredSkillsIds.length);
        }

        // Fetch some problems tagged to this company
        const problems = await Problem.find({
            companies: company.name,
            isActive: true
        }).populate('topic', 'name').limit(5);

        res.json({
            success: true,
            data: {
                company,
                userReadiness: matchPercentage,
                recommendedProblems: problems
            }
        });
    } catch (error) {
        next(error);
    }
};
