import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connStr = process.env.MONGODB_URI;
        if (!connStr) {
            console.warn('WARNING: MONGODB_URI environment variable is not defined. Using a local in-memory fallback pattern (or please set it in your .env file).');
            return;
        }
        const conn = await mongoose.connect(connStr);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        console.log('Server is running with database connection offline.');
    }
};

export default connectDB;
