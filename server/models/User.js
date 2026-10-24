import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
    createdAt: { type: Date, default: Date.now },

    // Onboarding fields
    isOnboarded: { type: Boolean, default: false },
    onboarding: {
        college: String,
        degree: String,
        graduationYear: Number,
        targetRole: String,
        preferredLanguage: { type: String, default: 'cpp' }, // cpp, java, python, javascript
        experienceLevel: { type: String, default: 'Beginner' }, // Beginner, Intermediate, Advanced
        targetCompanies: [String],
        preferredJobCategories: [String],
        currentDsaLevel: { type: String, default: 'Beginner' },
        dailyPrepTime: { type: Number, default: 2 }, // in hours
        currentSkills: [String]
    },

    // Streak tracking
    streak: {
        current: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        lastActive: { type: Date },
        activeDates: { type: [String], default: [] } // ISO date strings (yyyy-mm-dd)
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candiatePassword) {
    return bcrypt.compare(candiatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
