import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    logo: String, // Logo image filename/URL
    description: String,
    website: String,
    industry: String,

    roles: [String], // Roles hiring for (e.g. SDE, QA, Data Analyst)
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }], // Core skills required

    preparationData: {
        topics: [{
            topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
            importance: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
            description: String // "Amazon asks dynamic programming extensively in Round 1 & 2"
        }],
        interviewProcess: [String], // Steps (e.g. "Online Assessment", "Technical Round 1", "HR Round")
        tips: [String]
    },

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Company = mongoose.model('Company', companySchema);
export default Company;
