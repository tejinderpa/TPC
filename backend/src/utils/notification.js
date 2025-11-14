import { ApiError } from './ApiError.js';

// In-memory notification store (In production, use Redis or a database)
const notifications = new Map();

// Notification types
export const NOTIFICATION_TYPES = {
    JOB_APPLICATION: 'JOB_APPLICATION',
    APPLICATION_STATUS: 'APPLICATION_STATUS',
    INTERVIEW_SCHEDULE: 'INTERVIEW_SCHEDULE',
    DRIVE_NOTIFICATION: 'DRIVE_NOTIFICATION',
    EVENT_REGISTRATION: 'EVENT_REGISTRATION',
    EVENT_REMINDER: 'EVENT_REMINDER',
    MENTORSHIP_REQUEST: 'MENTORSHIP_REQUEST',
    MENTORSHIP_RESPONSE: 'MENTORSHIP_RESPONSE',
    REFERRAL_STATUS: 'REFERRAL_STATUS',
    REWARD_EARNED: 'REWARD_EARNED',
    PLACEMENT_UPDATE: 'PLACEMENT_UPDATE',
    SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
};

// Create notification
export const createNotification = async (userId, type, title, message, data = {}) => {
    try {
        const notification = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: userId.toString(),
            type,
            title,
            message,
            data,
            isRead: false,
            createdAt: new Date(),
        };

        // Store notification
        if (!notifications.has(userId.toString())) {
            notifications.set(userId.toString(), []);
        }

        const userNotifications = notifications.get(userId.toString());
        userNotifications.unshift(notification);

        // Keep only last 100 notifications per user
        if (userNotifications.length > 100) {
            userNotifications.pop();
        }

        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        throw new ApiError(500, 'Failed to create notification');
    }
};

// Get user notifications
export const getUserNotifications = (userId, limit = 50, unreadOnly = false) => {
    const userNotifications = notifications.get(userId.toString()) || [];

    let filteredNotifications = userNotifications;

    if (unreadOnly) {
        filteredNotifications = userNotifications.filter(n => !n.isRead);
    }

    return filteredNotifications.slice(0, limit);
};

// Mark notification as read
export const markAsRead = (userId, notificationId) => {
    const userNotifications = notifications.get(userId.toString()) || [];
    const notification = userNotifications.find(n => n.id === notificationId);

    if (notification) {
        notification.isRead = true;
        return true;
    }

    return false;
};

// Mark all notifications as read
export const markAllAsRead = (userId) => {
    const userNotifications = notifications.get(userId.toString()) || [];
    userNotifications.forEach(n => {
        n.isRead = true;
    });

    return userNotifications.length;
};

// Delete notification
export const deleteNotification = (userId, notificationId) => {
    const userNotifications = notifications.get(userId.toString()) || [];
    const index = userNotifications.findIndex(n => n.id === notificationId);

    if (index !== -1) {
        userNotifications.splice(index, 1);
        return true;
    }

    return false;
};

// Get unread count
export const getUnreadCount = (userId) => {
    const userNotifications = notifications.get(userId.toString()) || [];
    return userNotifications.filter(n => !n.isRead).length;
};

// Specific notification creators
export const notifyJobApplication = async (studentId, jobTitle, companyName) => {
    return await createNotification(
        studentId,
        NOTIFICATION_TYPES.JOB_APPLICATION,
        'Application Submitted',
        `Your application for ${jobTitle} at ${companyName} has been submitted successfully.`,
        { jobTitle, companyName }
    );
};

export const notifyApplicationStatus = async (studentId, jobTitle, companyName, status) => {
    return await createNotification(
        studentId,
        NOTIFICATION_TYPES.APPLICATION_STATUS,
        'Application Status Update',
        `Your application for ${jobTitle} at ${companyName} is now: ${status}`,
        { jobTitle, companyName, status }
    );
};

export const notifyInterviewSchedule = async (studentId, jobTitle, companyName, interviewDate) => {
    return await createNotification(
        studentId,
        NOTIFICATION_TYPES.INTERVIEW_SCHEDULE,
        'Interview Scheduled',
        `Your interview for ${jobTitle} at ${companyName} is scheduled on ${new Date(interviewDate).toLocaleDateString()}`,
        { jobTitle, companyName, interviewDate }
    );
};

export const notifyDrive = async (studentId, driveName, companyName, driveDate) => {
    return await createNotification(
        studentId,
        NOTIFICATION_TYPES.DRIVE_NOTIFICATION,
        'New Campus Drive',
        `${companyName} is conducting ${driveName} on ${new Date(driveDate).toLocaleDateString()}`,
        { driveName, companyName, driveDate }
    );
};

export const notifyEventRegistration = async (userId, eventName, eventDate) => {
    return await createNotification(
        userId,
        NOTIFICATION_TYPES.EVENT_REGISTRATION,
        'Event Registration Confirmed',
        `You have successfully registered for ${eventName} on ${new Date(eventDate).toLocaleDateString()}`,
        { eventName, eventDate }
    );
};

export const notifyEventReminder = async (userId, eventName, eventDate) => {
    return await createNotification(
        userId,
        NOTIFICATION_TYPES.EVENT_REMINDER,
        'Event Reminder',
        `Reminder: ${eventName} is scheduled for ${new Date(eventDate).toLocaleDateString()}`,
        { eventName, eventDate }
    );
};

export const notifyMentorshipRequest = async (alumniId, studentName, studentBranch) => {
    return await createNotification(
        alumniId,
        NOTIFICATION_TYPES.MENTORSHIP_REQUEST,
        'New Mentorship Request',
        `${studentName} from ${studentBranch} has requested mentorship from you`,
        { studentName, studentBranch }
    );
};

export const notifyMentorshipResponse = async (studentId, alumniName, status) => {
    return await createNotification(
        studentId,
        NOTIFICATION_TYPES.MENTORSHIP_RESPONSE,
        'Mentorship Request Response',
        `${alumniName} has ${status.toLowerCase()} your mentorship request`,
        { alumniName, status }
    );
};

export const notifyReferralStatus = async (studentId, jobTitle, companyName, status) => {
    return await createNotification(
        studentId,
        NOTIFICATION_TYPES.REFERRAL_STATUS,
        'Referral Status Update',
        `Your referral for ${jobTitle} at ${companyName} is now: ${status}`,
        { jobTitle, companyName, status }
    );
};

export const notifyRewardEarned = async (userId, points, reason) => {
    return await createNotification(
        userId,
        NOTIFICATION_TYPES.REWARD_EARNED,
        'Reward Points Earned',
        `You earned ${points} points for ${reason}`,
        { points, reason }
    );
};

export const notifyPlacementUpdate = async (studentId, companyName, packageAmount) => {
    return await createNotification(
        studentId,
        NOTIFICATION_TYPES.PLACEMENT_UPDATE,
        'Placement Confirmed',
        `Congratulations! You have been placed at ${companyName}${packageAmount ? ` with a package of ₹${packageAmount}` : ''}`,
        { companyName, packageAmount }
    );
};

export const notifySystemAnnouncement = async (userId, title, message) => {
    return await createNotification(
        userId,
        NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
        title,
        message,
        {}
    );
};

// Broadcast notification to multiple users
export const broadcastNotification = async (userIds, type, title, message, data = {}) => {
    const notifications = [];

    for (const userId of userIds) {
        const notification = await createNotification(userId, type, title, message, data);
        notifications.push(notification);
    }

    return notifications;
};

export default {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    NOTIFICATION_TYPES,
};
