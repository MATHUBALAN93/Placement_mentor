import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    platform: {
        type: String,
        enum: ['LeetCode', 'CodeChef', 'Codeforces', 'HackerRank', 'GeeksforGeeks', 'HackerEarth', 'AtCoder', 'InterviewBit', 'Other'],
        required: true
    },
    externalId: { type: String }, // e.g. "two-sum", "1"
    externalUrl: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },

    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true }, // Main category (e.g. Arrays, Trees)
    patterns: [String], // Specific pattern tags (e.g. Two Pointer, Sliding Window)
    subtopics: [String],
    companies: [String], // Companies that asked this (e.g. Amazon, Google)
    prerequisites: [String],
    tags: [String],

    estimatedTime: { type: Number, default: 30 }, // in minutes
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Indexes for searching and filtering
problemSchema.index({ platform: 1, difficulty: 1, topic: 1 });
problemSchema.index({ title: 'text', tags: 'text' });

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
