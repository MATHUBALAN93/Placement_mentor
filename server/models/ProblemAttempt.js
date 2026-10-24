import mongoose from 'mongoose';

const problemAttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },

    status: { type: String, enum: ['Attempted', 'Solved', 'Failed', 'Revisit Later'], required: true },
    language: String, // e.g. "cpp", "java", "python", "javascript"
    timeTaken: { type: Number, default: 0 }, // in minutes
    attemptCount: { type: Number, default: 1 },
    hintsUsed: { type: Number, default: 0 },
    solutionViewed: { type: Boolean, default: false },
    confidence: { type: Number, min: 1, max: 5 }, // 1 (low) to 5 (high)
    notes: String,
    code: String,

    createdAt: { type: Date, default: Date.now }
});

// Single and compound indexes for queries
problemAttemptSchema.index({ userId: 1, problemId: 1 });
problemAttemptSchema.index({ userId: 1, createdAt: -1 });

const ProblemAttempt = mongoose.model('ProblemAttempt', problemAttemptSchema);
export default ProblemAttempt;
