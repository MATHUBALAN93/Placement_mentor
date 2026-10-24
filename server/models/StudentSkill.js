import mongoose from 'mongoose';

const studentSkillSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },

    masteryScore: { type: Number, default: 0 }, // 0 to 100
    accuracy: { type: Number, default: 0 }, // percentage 0 to 100
    solvedCount: { type: Number, default: 0 },
    attemptedCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    hintsUsedCount: { type: Number, default: 0 },
    averageTimeTaken: { type: Number, default: 0 }, // in minutes
    lastPracticed: { type: Date, default: Date.now }
});

// Compound index to ensure uniqueness per user and skill
studentSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

const StudentSkill = mongoose.model('StudentSkill', studentSkillSchema);
export default StudentSkill;
