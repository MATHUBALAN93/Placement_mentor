import mongoose from 'mongoose';

const assessmentQuestionSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    patternName: String, // e.g. "Two Pointer"
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }], // 4 choices
    correctOptionIndex: { type: Number, required: true }, // Index 0-3
    explanation: String,
    estimatedTimeSeconds: { type: Number, default: 120 }
});

const AssessmentQuestion = mongoose.model('AssessmentQuestion', assessmentQuestionSchema);
export default AssessmentQuestion;
