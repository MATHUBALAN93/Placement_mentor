import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['DSA', 'Java', 'SQL', 'OOP', 'DBMS', 'HR', 'Technical', 'Mixed'], required: true },

    questions: [{
        questionText: String,
        studentAnswer: String,
        feedback: {
            isCorrect: Boolean,
            score: { type: Number, min: 1, max: 10 }, // 1 to 10 scale
            analysis: String, // Correctness, clarity, confidence, completeness
            followUpQuestion: String
        }
    }],

    status: { type: String, enum: ['In-Progress', 'Completed'], default: 'In-Progress' },
    currentQuestionIndex: { type: Number, default: 0 },

    evaluation: {
        technicalScore: { type: Number, default: 0 }, // 0 to 100
        communicationScore: { type: Number, default: 0 },
        problemSolvingScore: { type: Number, default: 0 },
        confidenceScore: { type: Number, default: 0 },
        overallScore: { type: Number, default: 0 },
        suggestions: [String]
    },

    createdAt: { type: Date, default: Date.now },
    completedAt: Date
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;
