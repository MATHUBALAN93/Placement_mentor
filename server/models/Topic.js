import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    createdAt: { type: Date, default: Date.now }
});

const Topic = mongoose.model('Topic', topicSchema);
export default Topic;
