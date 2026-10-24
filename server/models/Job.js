import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },

    requirements: {
        skills: [String],
        experienceYears: Number,
        technologies: [String],
        roles: [String]
    },

    location: String,
    salaryRange: String,
    createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
