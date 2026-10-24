import Skill from '../models/Skill.js';
import StudentSkill from '../models/StudentSkill.js';

// @desc    Get all skills available in the system
// @route   GET /api/skills
// @access  Public
export const getAllSkills = async (req, res, next) => {
    try {
        const skills = await Skill.find().populate('parentSkill', 'name');
        res.json({
            success: true,
            data: skills
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user's skill mastery profiles
// @route   GET /api/skills/my
// @access  Private
export const getMySkills = async (req, res, next) => {
    try {
        const studentSkills = await StudentSkill.find({ userId: req.user._id })
            .populate({
                path: 'skillId',
                select: 'name category parentSkill description'
            });

        res.json({
            success: true,
            data: studentSkills
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get specific skill details
// @route   GET /api/skills/:id
// @access  Private
export const getSkillDetail = async (req, res, next) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) {
            return res.status(404).json({ success: false, message: 'Skill not found' });
        }

        const studentSkill = await StudentSkill.findOne({
            userId: req.user._id,
            skillId: skill._id
        });

        res.json({
            success: true,
            data: {
                skill,
                mastery: studentSkill ? studentSkill.masteryScore : 0,
                stats: studentSkill || null
            }
        });
    } catch (error) {
        next(error);
    }
};
