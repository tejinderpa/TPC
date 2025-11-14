import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Mentorship} from "../models/mentorship.models.js";
import {Alumni} from "../models/alumni.models.js";
import {Student} from "../models/student.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const requestMentorship = asyncHandler(async (req, res) => {
    const {mentorId, mentorshipType, requestMessage} = req.body;
    const menteeId = req.student._id;

    if(!mentorId || !mentorshipType || !requestMessage){
        throw new ApiError(400, "Mentor ID, mentorship type and request message are required");
    }

    const mentor = await Alumni.findById(mentorId);
    if(!mentor){
        throw new ApiError(404, "Mentor not found");
    }

    if(!mentor.isAvailableForMentorship){
        throw new ApiError(400, "This alumni is not available for mentorship");
    }

    const existingRequest = await Mentorship.findOne({
        mentor: mentorId,
        mentee: menteeId,
        status: {$in: ['Requested', 'Accepted', 'Ongoing']}
    });

    if(existingRequest){
        throw new ApiError(409, "You already have an active mentorship request with this mentor");
    }

    const mentorship = await Mentorship.create({
        mentor: mentorId,
        mentee: menteeId,
        mentorshipType,
        requestMessage,
        status: 'Requested'
    });

    const createdMentorship = await Mentorship.findById(mentorship._id)
        .populate('mentor', 'fullName email avatar currentCompany currentDesignation')
        .populate('mentee', 'fullName email enrollmentNumber branch batch');

    return res.status(201).json(
        new ApiResponse(201, createdMentorship, "Mentorship request sent successfully")
    );
});

const respondToMentorshipRequest = asyncHandler(async (req, res) => {
    const {mentorshipId} = req.params;
    const {status, responseMessage} = req.body;
    const mentorId = req.alumni._id;

    if(!mentorshipId || !status){
        throw new ApiError(400, "Mentorship ID and status are required");
    }

    const validStatuses = ['Accepted', 'Rejected'];
    if(!validStatuses.includes(status)){
        throw new ApiError(400, "Invalid status. Use 'Accepted' or 'Rejected'");
    }

    const mentorship = await Mentorship.findById(mentorshipId);
    if(!mentorship){
        throw new ApiError(404, "Mentorship request not found");
    }

    if(mentorship.mentor.toString() !== mentorId.toString()){
        throw new ApiError(403, "You are not authorized to respond to this request");
    }

    if(mentorship.status !== 'Requested'){
        throw new ApiError(400, "This request has already been responded to");
    }

    mentorship.status = status === 'Accepted' ? 'Ongoing' : 'Rejected';
    mentorship.responseMessage = responseMessage || "";
    if(status === 'Accepted'){
        mentorship.startDate = Date.now();
    }

    await mentorship.save();

    const updatedMentorship = await Mentorship.findById(mentorshipId)
        .populate('mentor', 'fullName email')
        .populate('mentee', 'fullName email');

    return res.status(200).json(
        new ApiResponse(200, updatedMentorship, `Mentorship request ${status.toLowerCase()} successfully`)
    );
});

const getMyMentorships = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, status} = req.query;
    const userId = req.student?._id || req.alumni?._id;
    const userType = req.student ? 'mentee' : 'mentor';

    const query = {[userType]: userId};
    if(status) query.status = status;

    const mentorships = await Mentorship.find(query)
        .populate('mentor', 'fullName email avatar currentCompany currentDesignation industry')
        .populate('mentee', 'fullName email enrollmentNumber branch batch avatar')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({createdAt: -1});

    const count = await Mentorship.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            mentorships,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalMentorships: count
        }, "Mentorships fetched successfully")
    );
});

const getMentorshipById = asyncHandler(async (req, res) => {
    const {mentorshipId} = req.params;

    if(!mentorshipId){
        throw new ApiError(400, "Mentorship ID is required");
    }

    const mentorship = await Mentorship.findById(mentorshipId)
        .populate('mentor', 'fullName email phone avatar currentCompany currentDesignation industry expertise socialLinks')
        .populate('mentee', 'fullName email phone enrollmentNumber branch batch avatar');

    if(!mentorship){
        throw new ApiError(404, "Mentorship not found");
    }

    return res.status(200).json(
        new ApiResponse(200, mentorship, "Mentorship fetched successfully")
    );
});

const addSession = asyncHandler(async (req, res) => {
    const {mentorshipId} = req.params;
    const {sessionDate, duration, mode, topic, notes} = req.body;

    if(!mentorshipId || !sessionDate || !duration || !mode){
        throw new ApiError(400, "Mentorship ID, session date, duration and mode are required");
    }

    const mentorship = await Mentorship.findById(mentorshipId);
    if(!mentorship){
        throw new ApiError(404, "Mentorship not found");
    }

    if(mentorship.status !== 'Ongoing'){
        throw new ApiError(400, "Can only add sessions to ongoing mentorships");
    }

    mentorship.sessions.push({
        sessionDate,
        duration,
        mode,
        topic: topic || "",
        notes: notes || ""
    });

    mentorship.totalSessions = mentorship.sessions.length;
    await mentorship.save();

    return res.status(200).json(
        new ApiResponse(200, mentorship, "Session added successfully")
    );
});

const addSessionFeedback = asyncHandler(async (req, res) => {
    const {mentorshipId, sessionId} = req.params;
    const {rating, comments} = req.body;

    if(!mentorshipId || !sessionId){
        throw new ApiError(400, "Mentorship ID and Session ID are required");
    }

    const mentorship = await Mentorship.findById(mentorshipId);
    if(!mentorship){
        throw new ApiError(404, "Mentorship not found");
    }

    const session = mentorship.sessions.id(sessionId);
    if(!session){
        throw new ApiError(404, "Session not found");
    }

    session.feedback = {
        rating: rating || null,
        comments: comments || ""
    };

    await mentorship.save();

    return res.status(200).json(
        new ApiResponse(200, mentorship, "Session feedback added successfully")
    );
});

const addGoal = asyncHandler(async (req, res) => {
    const {mentorshipId} = req.params;
    const {description, targetDate} = req.body;

    if(!mentorshipId || !description){
        throw new ApiError(400, "Mentorship ID and goal description are required");
    }

    const mentorship = await Mentorship.findById(mentorshipId);
    if(!mentorship){
        throw new ApiError(404, "Mentorship not found");
    }

    mentorship.goals.push({
        description,
        targetDate: targetDate || null,
        status: 'Pending'
    });

    await mentorship.save();

    return res.status(200).json(
        new ApiResponse(200, mentorship, "Goal added successfully")
    );
});

const updateGoalStatus = asyncHandler(async (req, res) => {
    const {mentorshipId, goalId} = req.params;
    const {status} = req.body;

    if(!mentorshipId || !goalId || !status){
        throw new ApiError(400, "Mentorship ID, Goal ID and status are required");
    }

    const validStatuses = ['Pending', 'In Progress', 'Achieved', 'Cancelled'];
    if(!validStatuses.includes(status)){
        throw new ApiError(400, "Invalid status");
    }

    const mentorship = await Mentorship.findById(mentorshipId);
    if(!mentorship){
        throw new ApiError(404, "Mentorship not found");
    }

    const goal = mentorship.goals.id(goalId);
    if(!goal){
        throw new ApiError(404, "Goal not found");
    }

    goal.status = status;
    if(status === 'Achieved'){
        goal.achievedDate = Date.now();
    }

    await mentorship.save();

    return res.status(200).json(
        new ApiResponse(200, mentorship, "Goal status updated successfully")
    );
});

const completeMentorship = asyncHandler(async (req, res) => {
    const {mentorshipId} = req.params;
    const {mentorRating, mentorComments, menteeRating, menteeComments} = req.body;

    if(!mentorshipId){
        throw new ApiError(400, "Mentorship ID is required");
    }

    const mentorship = await Mentorship.findById(mentorshipId);
    if(!mentorship){
        throw new ApiError(404, "Mentorship not found");
    }

    mentorship.status = 'Completed';
    mentorship.endDate = Date.now();
    mentorship.overallFeedback = {
        mentorRating: mentorRating || null,
        mentorComments: mentorComments || "",
        menteeRating: menteeRating || null,
        menteeComments: menteeComments || ""
    };

    await mentorship.save();

    return res.status(200).json(
        new ApiResponse(200, mentorship, "Mentorship completed successfully")
    );
});

const cancelMentorship = asyncHandler(async (req, res) => {
    const {mentorshipId} = req.params;

    if(!mentorshipId){
        throw new ApiError(400, "Mentorship ID is required");
    }

    const mentorship = await Mentorship.findByIdAndUpdate(
        mentorshipId,
        {$set: {status: 'Cancelled'}},
        {new: true}
    ).populate('mentor', 'fullName email')
     .populate('mentee', 'fullName email');

    if(!mentorship){
        throw new ApiError(404, "Mentorship not found");
    }

    return res.status(200).json(
        new ApiResponse(200, mentorship, "Mentorship cancelled successfully")
    );
});

const getMentorshipStatistics = asyncHandler(async (req, res) => {
    const {startDate, endDate} = req.query;

    const matchQuery = {};
    if(startDate && endDate){
        matchQuery.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await Mentorship.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$status',
                count: {$sum: 1},
                avgSessions: {$avg: '$totalSessions'}
            }
        }
    ]);

    const typeStats = await Mentorship.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$mentorshipType',
                count: {$sum: 1}
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            byStatus: stats,
            byType: typeStats
        }, "Mentorship statistics fetched successfully")
    );
});

export {
    requestMentorship,
    respondToMentorshipRequest,
    getMyMentorships,
    getMentorshipById,
    addSession,
    addSessionFeedback,
    addGoal,
    updateGoalStatus,
    completeMentorship,
    cancelMentorship,
    getMentorshipStatistics
};
