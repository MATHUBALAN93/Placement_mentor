import mongoose from 'mongoose';

const patternSchema = new mongoose.Schema({
    name: { type: String, required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    description: String,
    createdAt: { type: Date, default: Date.now }
});

const Pattern = mongoose.model('Pattern', patternSchema);
export default Pattern;
