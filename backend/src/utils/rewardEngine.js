import { Reward } from '../models/reward.models.js';
import { Student } from '../models/student.models.js';

// Reward point values
export const REWARD_POINTS = {
    // Event participation
    EVENT_REGISTRATION: 5,
    EVENT_ATTENDANCE: 10,
    EVENT_CERTIFICATE: 15,
    
    // Job application
    APPLICATION_SUBMITTED: 2,
    SHORTLISTED: 10,
    INTERVIEW_CLEARED: 20,
    JOB_OFFER: 50,
    PLACEMENT_CONFIRMED: 100,
    
    // Academic achievements
    CGPA_ABOVE_9: 50,
    CGPA_ABOVE_8: 30,
    NO_BACKLOGS: 20,
    
    // Profile completion
    PROFILE_COMPLETE: 10,
    RESUME_UPLOADED: 5,
    SKILLS_ADDED: 5,
    
    // Referrals
    REFERRAL_CREATED: 5,
    REFERRAL_SHORTLISTED: 15,
    REFERRAL_SELECTED: 30,
    
    // Mentorship
    MENTORSHIP_SESSION_ATTENDED: 10,
    MENTORSHIP_COMPLETED: 50,
    
    // Special achievements
    HACKATHON_PARTICIPATION: 25,
    COMPETITION_WIN: 50,
    CERTIFICATION: 20,
    INTERNSHIP_COMPLETED: 30,
};

// Calculate reward points based on action
export const calculateRewardPoints = (rewardType, additionalData = {}) => {
    let points = 0;

    switch (rewardType) {
        case 'Event Registration':
            points = REWARD_POINTS.EVENT_REGISTRATION;
            break;
        case 'Event Participation':
        case 'Event Attendance':
            points = REWARD_POINTS.EVENT_ATTENDANCE;
            break;
        case 'Event Certificate':
            points = REWARD_POINTS.EVENT_CERTIFICATE;
            break;
        case 'Job Application':
            points = REWARD_POINTS.APPLICATION_SUBMITTED;
            break;
        case 'Shortlisted':
            points = REWARD_POINTS.SHORTLISTED;
            break;
        case 'Interview Cleared':
            points = REWARD_POINTS.INTERVIEW_CLEARED;
            break;
        case 'Job Offer':
            points = REWARD_POINTS.JOB_OFFER;
            break;
        case 'Placement':
            points = REWARD_POINTS.PLACEMENT_CONFIRMED;
            break;
        case 'Profile Completion':
            points = REWARD_POINTS.PROFILE_COMPLETE;
            break;
        case 'Resume Upload':
            points = REWARD_POINTS.RESUME_UPLOADED;
            break;
        case 'Skills Added':
            points = REWARD_POINTS.SKILLS_ADDED;
            break;
        case 'Referral Created':
            points = REWARD_POINTS.REFERRAL_CREATED;
            break;
        case 'Referral Shortlisted':
            points = REWARD_POINTS.REFERRAL_SHORTLISTED;
            break;
        case 'Referral Selected':
            points = REWARD_POINTS.REFERRAL_SELECTED;
            break;
        case 'Mentorship Session':
            points = REWARD_POINTS.MENTORSHIP_SESSION_ATTENDED;
            break;
        case 'Mentorship Completed':
            points = REWARD_POINTS.MENTORSHIP_COMPLETED;
            break;
        case 'Hackathon':
            points = REWARD_POINTS.HACKATHON_PARTICIPATION;
            break;
        case 'Competition':
            points = REWARD_POINTS.COMPETITION_WIN;
            break;
        case 'Certification':
            points = REWARD_POINTS.CERTIFICATION;
            break;
        case 'Internship':
            points = REWARD_POINTS.INTERNSHIP_COMPLETED;
            break;
        case 'Academic Achievement':
            // Calculate based on CGPA
            const cgpa = additionalData.cgpa;
            if (cgpa >= 9.0) {
                points = REWARD_POINTS.CGPA_ABOVE_9;
            } else if (cgpa >= 8.0) {
                points = REWARD_POINTS.CGPA_ABOVE_8;
            }
            break;
        case 'No Backlogs':
            points = REWARD_POINTS.NO_BACKLOGS;
            break;
        default:
            points = additionalData.points || 0;
    }

    return points;
};

// Award points to a student
export const awardPoints = async (studentId, rewardType, description, entityType = null, entityId = null, additionalData = {}) => {
    try {
        const points = calculateRewardPoints(rewardType, additionalData);

        if (points === 0) {
            return null;
        }

        // Check if reward already exists for this entity
        if (entityType && entityId) {
            const existingReward = await Reward.findOne({
                student: studentId,
                rewardType,
                'relatedEntity.entityType': entityType,
                'relatedEntity.entityId': entityId,
            });

            if (existingReward) {
                console.log('Reward already awarded for this entity');
                return existingReward;
            }
        }

        // Create reward entry
        const reward = await Reward.create({
            student: studentId,
            rewardType,
            points,
            description,
            relatedEntity: entityType && entityId ? {
                entityType,
                entityId,
            } : undefined,
        });

        return reward;
    } catch (error) {
        console.error('Error awarding points:', error);
        return null;
    }
};

// Get student total points
export const getStudentPoints = async (studentId) => {
    try {
        const rewards = await Reward.find({ student: studentId });
        const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);
        return totalPoints;
    } catch (error) {
        console.error('Error calculating student points:', error);
        return 0;
    }
};

// Get leaderboard
export const getLeaderboard = async (limit = 10, branch = null, batch = null) => {
    try {
        const pipeline = [
            {
                $group: {
                    _id: '$student',
                    totalPoints: { $sum: '$points' },
                    rewardCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'studentInfo',
                },
            },
            { $unwind: '$studentInfo' },
        ];

        // Add filters
        if (branch || batch) {
            const matchStage = { $match: {} };
            if (branch) matchStage.$match['studentInfo.branch'] = branch;
            if (batch) matchStage.$match['studentInfo.batch'] = batch;
            pipeline.push(matchStage);
        }

        pipeline.push(
            { $sort: { totalPoints: -1 } },
            { $limit: limit },
            {
                $project: {
                    studentId: '$_id',
                    studentName: '$studentInfo.fullName',
                    enrollmentNumber: '$studentInfo.enrollmentNumber',
                    branch: '$studentInfo.branch',
                    batch: '$studentInfo.batch',
                    avatar: '$studentInfo.avatar',
                    totalPoints: 1,
                    rewardCount: 1,
                },
            }
        );

        const leaderboard = await Reward.aggregate(pipeline);
        return leaderboard;
    } catch (error) {
        console.error('Error generating leaderboard:', error);
        return [];
    }
};

// Calculate student rank
export const getStudentRank = async (studentId, branch = null, batch = null) => {
    try {
        const studentPoints = await getStudentPoints(studentId);

        const matchStage = {};
        if (branch || batch) {
            const student = await Student.findById(studentId);
            if (branch) matchStage['studentInfo.branch'] = student.branch;
            if (batch) matchStage['studentInfo.batch'] = student.batch;
        }

        const pipeline = [
            {
                $group: {
                    _id: '$student',
                    totalPoints: { $sum: '$points' },
                },
            },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'studentInfo',
                },
            },
            { $unwind: '$studentInfo' },
        ];

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push(
            { $sort: { totalPoints: -1 } },
            {
                $group: {
                    _id: null,
                    students: { $push: { studentId: '$_id', totalPoints: '$totalPoints' } },
                },
            }
        );

        const result = await Reward.aggregate(pipeline);

        if (result.length === 0) {
            return { rank: 1, totalStudents: 1, points: studentPoints };
        }

        const students = result[0].students;
        const rank = students.findIndex(s => s.studentId.toString() === studentId.toString()) + 1;

        return {
            rank: rank || students.length + 1,
            totalStudents: students.length,
            points: studentPoints,
        };
    } catch (error) {
        console.error('Error calculating student rank:', error);
        return { rank: 0, totalStudents: 0, points: 0 };
    }
};

// Get reward statistics
export const getRewardStatistics = async (studentId = null, branch = null, batch = null) => {
    try {
        const matchStage = {};
        if (studentId) matchStage.student = studentId;

        const pipeline = [{ $match: matchStage }];

        if (branch || batch) {
            pipeline.push(
                {
                    $lookup: {
                        from: 'students',
                        localField: 'student',
                        foreignField: '_id',
                        as: 'studentInfo',
                    },
                },
                { $unwind: '$studentInfo' }
            );

            const filterStage = { $match: {} };
            if (branch) filterStage.$match['studentInfo.branch'] = branch;
            if (batch) filterStage.$match['studentInfo.batch'] = batch;
            pipeline.push(filterStage);
        }

        pipeline.push(
            {
                $group: {
                    _id: '$rewardType',
                    totalPoints: { $sum: '$points' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { totalPoints: -1 } }
        );

        const statistics = await Reward.aggregate(pipeline);
        return statistics;
    } catch (error) {
        console.error('Error generating reward statistics:', error);
        return [];
    }
};

export default {
    calculateRewardPoints,
    awardPoints,
    getStudentPoints,
    getLeaderboard,
    getStudentRank,
    getRewardStatistics,
    REWARD_POINTS,
};
