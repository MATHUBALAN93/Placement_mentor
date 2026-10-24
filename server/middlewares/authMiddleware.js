import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateUser = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token missing',
        });
    }

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_for_local_dev';
        const decoded = jwt.verify(token, secret);

        // Attach user to request (excluding password)
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user not found',
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token invalid or expired',
        });
    }
};
