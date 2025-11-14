import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Reward} from "../models/reward.models.js";
import {Student} from "../models/student.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const createReward = asyncHandler(async (req, res) => {
    const {studentId, rewardType, points, description, entityType, entityId, expiryDate} = req.body;

    if(!studentId || !rewardType || !points || !description){
        throw new ApiError(400, "Student ID, reward type, points and description are required");
    }

    const validRewardTypes = ['Profile Completion', 'Event Participation', 'Job Application', 'Interview Cleared', 'Placement', 'Referral', 'Achievement', 'Other'];
    if(!validRewardTypes.includes(rewardType)){
        throw new ApiError(400, "Invalid reward type");
    }

    if(points < 0){
        throw new ApiError(400, "Points must be a positive number");
    }

    const student = await Student.findById(studentId);
    if(!student){
        throw new ApiError(404, "Student not found");
    }

    const reward = await Reward.create({
        student: studentId,
        rewardType,
        points,
        description,
        relatedEntity: {
            entityType: entityType || 'None',
            entityId: entityId || null
        },
        expiryDate: expiryDate || null,
        isActive: true
    });

    const createdReward = await Reward.findById(reward._id)
        .populate('student', 'fullName email enrollmentNumber branch batch');

    return res.status(201).json(
        new ApiResponse(201, createdReward, "Reward created successfully")
    );
});

const getMyRewards = asyncHandler(async (req, res) => {
    const studentId = req.student._id;
    const {page = 1, limit = 10, rewardType, isActive} = req.query;

    const query = {student: studentId};
    if(rewardType) query.rewardType = rewardType;
    if(isActive !== undefined) query.isActive = isActive === 'true';

    const rewards = await Reward.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({awardedDate: -1});

    const count = await Reward.countDocuments(query);

    // Calculate total points
    const totalPoints = await Reward.aggregate([
        {$match: {student: studentId, isActive: true}},
        {$group: {_id: null, total: {$sum: '$points'}}}
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            rewards,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalRewards: count,
            totalPoints: totalPoints.length > 0 ? totalPoints[0].total : 0
        }, "Rewards fetched successfully")
    );
});

const getStudentRewards = asyncHandler(async (req, res) => {
    const {studentId} = req.params;
    const {page = 1, limit = 10, rewardType, isActive} = req.query;

    if(!studentId){
        throw new ApiError(400, "Student ID is required");
    }

    const query = {student: studentId};
    if(rewardType) query.rewardType = rewardType;
    if(isActive !== undefined) query.isActive = isActive === 'true';

    const rewards = await Reward.find(query)
        .populate('student', 'fullName email enrollmentNumber branch batch')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({awardedDate: -1});

    const count = await Reward.countDocuments(query);

    // Calculate total points
    const totalPoints = await Reward.aggregate([
        {$match: {student: studentId, isActive: true}},
        {$group: {_id: null, total: {$sum: '$points'}}}
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            rewards,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalRewards: count,
            totalPoints: totalPoints.length > 0 ? totalPoints[0].total : 0
        }, "Rewards fetched successfully")
    );
});

const getAllRewards = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, rewardType, isActive, startDate, endDate} = req.query;

    const query = {};
    if(rewardType) query.rewardType = rewardType;
    if(isActive !== undefined) query.isActive = isActive === 'true';
    if(startDate && endDate){
        query.awardedDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const rewards = await Reward.find(query)
        .populate('student', 'fullName email enrollmentNumber branch batch')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({awardedDate: -1});

    const count = await Reward.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            rewards,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalRewards: count
        }, "Rewards fetched successfully")
    );
});

const getRewardById = asyncHandler(async (req, res) => {
    const {rewardId} = req.params;

    if(!rewardId){
        throw new ApiError(400, "Reward ID is required");
    }

    const reward = await Reward.findById(rewardId)
        .populate('student', 'fullName email enrollmentNumber branch batch phone');

    if(!reward){
        throw new ApiError(404, "Reward not found");
    }

    return res.status(200).json(
        new ApiResponse(200, reward, "Reward fetched successfully")
    );
});

const updateReward = asyncHandler(async (req, res) => {
    const {rewardId} = req.params;
    const {points, description, isActive, expiryDate} = req.body;

    if(!rewardId){
        throw new ApiError(400, "Reward ID is required");
    }

    const reward = await Reward.findById(rewardId);
    if(!reward){
        throw new ApiError(404, "Reward not found");
    }

    if(points !== undefined) reward.points = points;
    if(description) reward.description = description;
    if(isActive !== undefined) reward.isActive = isActive;
    if(expiryDate) reward.expiryDate = expiryDate;

    await reward.save();

    const updatedReward = await Reward.findById(rewardId)
        .populate('student', 'fullName email enrollmentNumber');

    return res.status(200).json(
        new ApiResponse(200, updatedReward, "Reward updated successfully")
    );
});

const deactivateReward = asyncHandler(async (req, res) => {
    const {rewardId} = req.params;

    if(!rewardId){
        throw new ApiError(400, "Reward ID is required");
    }

    const reward = await Reward.findByIdAndUpdate(
        rewardId,
        {$set: {isActive: false}},
        {new: true}
    ).populate('student', 'fullName email enrollmentNumber');

    if(!reward){
        throw new ApiError(404, "Reward not found");
    }

    return res.status(200).json(
        new ApiResponse(200, reward, "Reward deactivated successfully")
    );
});

const deleteReward = asyncHandler(async (req, res) => {
    const {rewardId} = req.params;

    if(!rewardId){
        throw new ApiError(400, "Reward ID is required");
    }

    const reward = await Reward.findByIdAndDelete(rewardId);
    if(!reward){
        throw new ApiError(404, "Reward not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Reward deleted successfully")
    );
});

const getRewardLeaderboard = asyncHandler(async (req, res) => {
    const {limit = 10, branch, batch} = req.query;

    const matchQuery = {isActive: true};

    const leaderboard = await Reward.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$student',
                totalPoints: {$sum: '$points'},
                totalRewards: {$sum: 1}
            }
        },
        {
            $lookup: {
                from: 'students',
                localField: '_id',
                foreignField: '_id',
                as: 'studentInfo'
            }
        },
        {$unwind: '$studentInfo'},
        {
            $match: {
                ...(branch && {'studentInfo.branch': branch}),
                ...(batch && {'studentInfo.batch': parseInt(batch)})
            }
        },
        {
            $project: {
                _id: 1,
                totalPoints: 1,
                totalRewards: 1,
                fullName: '$studentInfo.fullName',
                enrollmentNumber: '$studentInfo.enrollmentNumber',
                branch: '$studentInfo.branch',
                batch: '$studentInfo.batch',
                avatar: '$studentInfo.avatar'
            }
        },
        {$sort: {totalPoints: -1}},
        {$limit: parseInt(limit)}
    ]);

    return res.status(200).json(
        new ApiResponse(200, leaderboard, "Reward leaderboard fetched successfully")
    );
});

const getRewardStatistics = asyncHandler(async (req, res) => {
    const {startDate, endDate} = req.query;

    const matchQuery = {isActive: true};
    if(startDate && endDate){
        matchQuery.awardedDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await Reward.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$rewardType',
                totalRewards: {$sum: 1},
                totalPoints: {$sum: '$points'},
                averagePoints: {$avg: '$points'}
            }
        },
        {$sort: {totalPoints: -1}}
    ]);

    const totalStats = await Reward.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: null,
                totalRewards: {$sum: 1},
                totalPoints: {$sum: '$points'},
                averagePoints: {$avg: '$points'}
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            byType: stats,
            overall: totalStats.length > 0 ? totalStats[0] : {totalRewards: 0, totalPoints: 0, averagePoints: 0}
        }, "Reward statistics fetched successfully")
    );
});

const calculateProfileCompletionReward = asyncHandler(async (req, res) => {
    const studentId = req.student._id;

    const student = await Student.findById(studentId).populate('profile');
    if(!student){
        throw new ApiError(404, "Student not found");
    }

    if(!student.profile){
        throw new ApiError(400, "Student profile not found");
    }

    // Check if reward already exists
    const existingReward = await Reward.findOne({
        student: studentId,
        rewardType: 'Profile Completion'
    });

    if(existingReward){
        throw new ApiError(409, "Profile completion reward already awarded");
    }

    // Calculate completion percentage and award points
    const profile = student.profile;
    let completionScore = 0;

    if(profile.resume) completionScore += 20;
    if(profile.bio) completionScore += 10;
    if(profile.skills && profile.skills.length > 0) completionScore += 15;
    if(profile.projects && profile.projects.length > 0) completionScore += 15;
    if(profile.certifications && profile.certifications.length > 0) completionScore += 10;
    if(profile.internships && profile.internships.length > 0) completionScore += 15;
    if(profile.socialLinks && (profile.socialLinks.linkedin || profile.socialLinks.github)) completionScore += 15;

    if(completionScore >= 80){
        const reward = await Reward.create({
            student: studentId,
            rewardType: 'Profile Completion',
            points: 100,
            description: `Profile ${completionScore}% completed`,
            relatedEntity: {
                entityType: 'None',
                entityId: null
            }
        });

        return res.status(201).json(
            new ApiResponse(201, reward, "Profile completion reward awarded successfully")
        );
    } else {
        return res.status(200).json(
            new ApiResponse(200, {completionScore}, `Profile ${completionScore}% completed. Complete at least 80% to earn rewards`)
        );
    }
});

export {
    createReward,
    getMyRewards,
    getStudentRewards,
    getAllRewards,
    getRewardById,
    updateReward,
    deactivateReward,
    deleteReward,
    getRewardLeaderboard,
    getRewardStatistics,
    calculateProfileCompletionReward
};
