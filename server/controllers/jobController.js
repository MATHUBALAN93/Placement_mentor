import JobMatch from '../models/JobMatch.js';
import Resume from '../models/Resume.js';
import { calculateJobDescriptionMatch } from '../services/aiService.js';

// @desc    Match resume against pasted Job Description
// @route   POST /api/jobs/analyze
// @access  Private
export const analyzeJobDescriptionAndMatch = async (req, res, next) => {
    const { jdText, resumeId, jobTitle, companyName } = req.body;

    try {
        if (!jdText) {
            return res.status(400).json({ success: false, message: 'Please provide a job description' });
        }

        // Resolve which resume to use
        let targetResumeId = resumeId;
        if (!targetResumeId) {
            // Find latest resume for user
            const latestResume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
            if (!latestResume) {
                return res.status(400).json({ success: false, message: 'Please upload a resume first before calculating job match profiles' });
            }
            targetResumeId = latestResume._id;
        }

        const resume = await Resume.findById(targetResumeId);
        if (!resume) {
            return res.status(404).json({ success: false, message: 'Target resume not found' });
        }

        // Synthesize text fields for semantic analysis comparison
        const resumeOverview = `
Resume name: ${resume.extractedData.name}
Extracted Skills: ${resume.extractedData.skills.join(', ')}
Extracted Projects: ${resume.extractedData.projects.join('; ')}
Extracted Experience: ${resume.extractedData.experience.join('; ')}
    `;

        // Trigger AI semantic matcher
        const matchAnalysis = await calculateJobDescriptionMatch(resumeOverview, jdText);

        // Save comparison details
        const jobMatch = await JobMatch.create({
            userId: req.user._id,
            resumeId: resume._id,
            jobTitle: jobTitle || 'Target Role',
            companyName: companyName || 'Target Company',
            rawJobDescription: jdText,
            matchScore: matchAnalysis.matchScore || 50,
            matchingSkills: matchAnalysis.matchingSkills || [],
            missingSkills: matchAnalysis.missingSkills || [],
            partialMatches: matchAnalysis.partialMatches || [],
            resumeImprovementSuggestions: matchAnalysis.resumeImprovementSuggestions || [],
            recommendedLearning: matchAnalysis.recommendedLearning || []
        });

        res.json({
            success: true,
            message: 'Job description matched successfully',
            data: jobMatch
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's job matches history
// @route   GET /api/jobs/matches
// @access  Private
export const getMyMatches = async (req, res, next) => {
    try {
        const matches = await JobMatch.find({ userId: req.user._id })
            .populate('resumeId', 'fileName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: matches
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get details of a specific job match comparison
// @route   GET /api/jobs/matches/:id
// @access  Private
export const getMatchDetail = async (req, res, next) => {
    try {
        const match = await JobMatch.findById(req.params.id)
            .populate('resumeId', 'fileName');

        if (!match) {
            return res.status(404).json({ success: false, message: 'Job match details not found' });
        }

        if (match.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this match' });
        }

        res.json({
            success: true,
            data: match
        });
    } catch (error) {
        next(error);
    }
};
