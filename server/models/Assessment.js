import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentQuestion', required: true },
        studentAnswerIndex: Number, // Index selected by student (0-3) or null/undefined if skipped
        isCorrect: Boolean,
        timeTakenSeconds: Number,
        attemptsCount: { type: Number, default: 1 }
    }],
    status: { type: String, enum: ['In-Progress', 'Completed'], default: 'In-Progress' },
    score: { type: Number, default: 0 }, // Correct count or percentage
    totalQuestions: { type: Number, default: 0 },
    aiSummary: String, // "You have strong foundation in arrays, but graph traversal is weak..."
    createdAt: { type: Date, default: Date.now },
    completedAt: Date
});

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
