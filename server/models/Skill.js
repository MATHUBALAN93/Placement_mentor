import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, enum: ['DSA', 'LANGUAGE', 'CS_FUNDAMENTALS', 'SYSTEM_DESIGN', 'APTITUDE', 'SOFT_SKILLS'], required: true },
    parentSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }, // Hierarchical mapping
    description: String,
    estimatedHours: { type: Number, default: 10 }
});

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
