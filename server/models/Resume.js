import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    filePath: String,

    extractedData: {
        name: String,
        email: String,
        phone: String,
        education: [String],
        skills: [String],
        projects: [String],
        experience: [String],
        certifications: [String],
        technologies: [String]
    },

    evaluation: {
        overallScore: { type: Number, default: 0 }, // 0 to 100
        technicalSkillsScore: { type: Number, default: 0 },
        projectsScore: { type: Number, default: 0 },
        experienceScore: { type: Number, default: 0 },
        formattingScore: { type: Number, default: 0 },

        strengths: [String],
        missingSkills: [String],
        weakDescriptions: [String],
        improvementSuggestions: [String]
    },

    createdAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
