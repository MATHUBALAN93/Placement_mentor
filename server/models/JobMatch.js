import mongoose from 'mongoose';

const jobMatchSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }, // Optional reference to stored Job

    // Stored JD details if not referencing a Job record
    jobTitle: String,
    companyName: String,
    rawJobDescription: String,

    matchScore: { type: Number, default: 0 }, // 0 to 100
    matchingSkills: [String],
    missingSkills: [String],
    partialMatches: [{
        resumeSkill: String,
        jobRequiredSkill: String,
        explanation: String
    }],

    resumeImprovementSuggestions: [String],
    recommendedLearning: [{
        skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        skillName: String,
        reason: String
    }],

    createdAt: { type: Date, default: Date.now }
});

jobMatchSchema.index({ userId: 1 });

const JobMatch = mongoose.model('JobMatch', jobMatchSchema);
export default JobMatch;
