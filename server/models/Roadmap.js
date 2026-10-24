import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, default: 'Software Engineer' },
    phases: [{
        name: { type: String, required: true }, // Foundation, Core Patterns, Advanced, etc.
        status: { type: String, enum: ['Locked', 'In Progress', 'Completed', 'Needs Revision'], default: 'Locked' },
        skills: [{
            skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
            name: String,
            masteryRequired: { type: Number, default: 70 },
            isCompleted: { type: Boolean, default: false },
            recommendedClass: String
        }],
        order: { type: Number, default: 0 }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
