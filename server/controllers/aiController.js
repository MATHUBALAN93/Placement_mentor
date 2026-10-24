import {
    analyzeSolutionCode,
    generateHint,
    explainConceptMessage
} from '../services/aiService.js';
import { getAdaptiveRecommendations, getDailySchedule } from '../services/recommendationService.js';
import StudentSkill from '../models/StudentSkill.js';

// @desc    Get coding hints progressively (Level 1-6)
// @route   POST /api/ai/hint
// @access  Private
export const getCodingHint = async (req, res, next) => {
    const { code, problemTitle, language, hintLevel } = req.body;

    try {
        if (!problemTitle || !language || !hintLevel) {
            return res.status(400).json({ success: false, message: 'Missing required parameters' });
        }

        const hint = await generateHint(code || '', problemTitle, language, hintLevel);
        res.json({
            success: true,
            data: { hint }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Explain topic details in grounded terms
// @route   POST /api/ai/explain
// @access  Private
export const getConceptExplanation = async (req, res, next) => {
    const { conceptQuery } = req.body;

    try {
        if (!conceptQuery) {
            return res.status(400).json({ success: false, message: 'Concept query is required' });
        }

        const studentSkills = await StudentSkill.find({ userId: req.user._id }).populate('skillId', 'name');
        const skillHistory = studentSkills.map(ss => ({
            skill: ss.skillId.name,
            mastery: ss.masteryScore
        }));

        const explanation = await explainConceptMessage(conceptQuery, req.user.name, skillHistory);
        res.json({
            success: true,
            data: { explanation }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Analyze correctness / review solution
// @route   POST /api/ai/analyze-solution
// @access  Private
export const getSolutionAnalysis = async (req, res, next) => {
    const { code, problemTitle, language } = req.body;

    try {
        if (!problemTitle || !language || !code) {
            return res.status(400).json({ success: false, message: 'Missing problem details or code segment' });
        }

        const analysis = await analyzeSolutionCode(code, problemTitle, language);
        res.json({
            success: true,
            data: { analysis }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Retrieve adaptive recommendations dynamically
// @route   GET /api/ai/recommend
// @access  Private
export const getRecommendations = async (req, res, next) => {
    try {
        const list = await getAdaptiveRecommendations(req.user._id);
        res.json({
            success: true,
            data: list
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Retrieve personalized daily scheduling learning-plan
// @route   POST /api/ai/learning-plan
// @access  Private
export const getLearningPlanSchedule = async (req, res, next) => {
    const { availableHours } = req.body;

    try {
        const hours = Number(availableHours) || 2;
        const plan = await getDailySchedule(req.user._id, hours);
        res.json({
            success: true,
            data: plan
        });
    } catch (error) {
        next(error);
    }
};
