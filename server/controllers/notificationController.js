import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res, next) => {
    try {
        const list = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: list
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.json({
            success: true,
            message: 'Notification marked read',
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all user notifications read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({
            success: true,
            message: 'All notifications marked read'
        });
    } catch (error) {
        next(error);
    }
};
