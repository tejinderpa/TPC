import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Shortlist} from "../models/shortlist.models.js";
import {Application} from "../models/application.models.js";
import {Student} from "../models/student.models.js";
import {Job} from "../models/job.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const createShortlist = asyncHandler(async (req, res) => {
    const {applicationId, shortlistedFor, interviewDetails} = req.body;

    if(!applicationId || !shortlistedFor){
        throw new ApiError(400, "Application ID and shortlisted for field are required");
    }

    const application = await Application.findById(applicationId)
        .populate('student')
        .populate('job')
        .populate('drive');

    if(!application){
        throw new ApiError(404, "Application not found");
    }

    const existingShortlist = await Shortlist.findOne({application: applicationId});
    if(existingShortlist){
        throw new ApiError(409, "Application already shortlisted");
    }

    const shortlist = await Shortlist.create({
        application: applicationId,
        student: application.student._id,
        job: application.job._id,
        company: application.job.company,
        drive: application.drive?._id || null,
        shortlistedFor,
        status: 'Pending',
        interviewDetails: interviewDetails || {},
        notificationSent: false
    });

    // Update application status to Shortlisted
    application.status = 'Shortlisted';
    await application.save();

    const createdShortlist = await Shortlist.findById(shortlist._id)
        .populate('student', 'fullName email enrollmentNumber branch batch cgpa phone avatar')
        .populate('job', 'jobTitle jobType salary location')
        .populate('company', 'companyName logo email');

    return res.status(201).json(
        new ApiResponse(201, createdShortlist, "Candidate shortlisted successfully")
    );
});

const getShortlistById = asyncHandler(async (req, res) => {
    const {shortlistId} = req.params;

    if(!shortlistId){
        throw new ApiError(400, "Shortlist ID is required");
    }

    const shortlist = await Shortlist.findById(shortlistId)
        .populate('student', 'fullName email enrollmentNumber branch batch cgpa phone avatar')
        .populate('job', 'jobTitle jobType salary location eligibilityCriteria')
        .populate('company', 'companyName logo email website')
        .populate('application')
        .populate('drive', 'driveName driveDate venue');

    if(!shortlist){
        throw new ApiError(404, "Shortlist not found");
    }

    return res.status(200).json(
        new ApiResponse(200, shortlist, "Shortlist fetched successfully")
    );
});

const getAllShortlists = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, jobId, companyId, driveId, status, branch} = req.query;

    const query = {};

    if(jobId) query.job = jobId;
    if(companyId) query.company = companyId;
    if(driveId) query.drive = driveId;
    if(status) query.status = status;

    const shortlists = await Shortlist.find(query)
        .populate({
            path: 'student',
            select: 'fullName email enrollmentNumber branch batch cgpa phone avatar',
            match: branch ? {branch: branch} : {}
        })
        .populate('job', 'jobTitle jobType salary')
        .populate('company', 'companyName logo')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({shortlistedDate: -1});

    const filteredShortlists = shortlists.filter(s => s.student !== null);

    const count = await Shortlist.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            shortlists: filteredShortlists,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalShortlists: count
        }, "Shortlists fetched successfully")
    );
});

const getMyShortlists = asyncHandler(async (req, res) => {
    const studentId = req.student._id;
    const {page = 1, limit = 10, status} = req.query;

    const query = {student: studentId};
    if(status) query.status = status;

    const shortlists = await Shortlist.find(query)
        .populate('job', 'jobTitle jobType salary location')
        .populate('company', 'companyName logo email')
        .populate('drive', 'driveName driveDate venue')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({shortlistedDate: -1});

    const count = await Shortlist.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            shortlists,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalShortlists: count
        }, "Shortlists fetched successfully")
    );
});

const updateShortlistStatus = asyncHandler(async (req, res) => {
    const {shortlistId} = req.params;
    const {status, feedback} = req.body;

    if(!shortlistId){
        throw new ApiError(400, "Shortlist ID is required");
    }

    if(!status){
        throw new ApiError(400, "Status is required");
    }

    const validStatuses = ['Pending', 'Confirmed', 'Rejected', 'Selected', 'On-Hold'];
    if(!validStatuses.includes(status)){
        throw new ApiError(400, "Invalid status");
    }

    const shortlist = await Shortlist.findById(shortlistId);
    if(!shortlist){
        throw new ApiError(404, "Shortlist not found");
    }

    shortlist.status = status;
    if(feedback){
        shortlist.feedback = {
            ...shortlist.feedback,
            ...feedback
        };
    }

    await shortlist.save();

    // Update application status accordingly
    if(status === 'Selected'){
        await Application.findByIdAndUpdate(shortlist.application, {$set: {status: 'Selected'}});
        await Student.findByIdAndUpdate(shortlist.student, {$set: {isPlaced: true}});
    } else if(status === 'Rejected'){
        await Application.findByIdAndUpdate(shortlist.application, {$set: {status: 'Rejected'}});
    }

    const updatedShortlist = await Shortlist.findById(shortlistId)
        .populate('student', 'fullName email enrollmentNumber')
        .populate('job', 'jobTitle')
        .populate('company', 'companyName');

    return res.status(200).json(
        new ApiResponse(200, updatedShortlist, "Shortlist status updated successfully")
    );
});

const scheduleInterview = asyncHandler(async (req, res) => {
    const {shortlistId} = req.params;
    const {scheduledDate, scheduledTime, venue, mode, meetingLink, panelMembers, duration} = req.body;

    if(!shortlistId){
        throw new ApiError(400, "Shortlist ID is required");
    }

    if(!scheduledDate){
        throw new ApiError(400, "Interview date is required");
    }

    const shortlist = await Shortlist.findById(shortlistId);
    if(!shortlist){
        throw new ApiError(404, "Shortlist not found");
    }

    shortlist.interviewDetails = {
        scheduledDate,
        scheduledTime: scheduledTime || "",
        venue: venue || "",
        mode: mode || 'Offline',
        meetingLink: meetingLink || "",
        panelMembers: panelMembers || [],
        duration: duration || null
    };

    shortlist.status = 'Confirmed';
    shortlist.notificationSent = false;

    await shortlist.save();

    const updatedShortlist = await Shortlist.findById(shortlistId)
        .populate('student', 'fullName email phone')
        .populate('job', 'jobTitle');

    return res.status(200).json(
        new ApiResponse(200, updatedShortlist, "Interview scheduled successfully")
    );
});

const addFeedback = asyncHandler(async (req, res) => {
    const {shortlistId} = req.params;
    const {rating, comments, strengths, weaknesses, recommendation} = req.body;

    if(!shortlistId){
        throw new ApiError(400, "Shortlist ID is required");
    }

    const shortlist = await Shortlist.findById(shortlistId);
    if(!shortlist){
        throw new ApiError(404, "Shortlist not found");
    }

    shortlist.feedback = {
        rating: rating || null,
        comments: comments || "",
        strengths: strengths || [],
        weaknesses: weaknesses || [],
        recommendation: recommendation || null
    };

    await shortlist.save();

    return res.status(200).json(
        new ApiResponse(200, shortlist, "Feedback added successfully")
    );
});

const deleteShortlist = asyncHandler(async (req, res) => {
    const {shortlistId} = req.params;

    if(!shortlistId){
        throw new ApiError(400, "Shortlist ID is required");
    }

    const shortlist = await Shortlist.findByIdAndDelete(shortlistId);
    if(!shortlist){
        throw new ApiError(404, "Shortlist not found");
    }

    // Revert application status
    await Application.findByIdAndUpdate(shortlist.application, {$set: {status: 'Under Review'}});

    return res.status(200).json(
        new ApiResponse(200, {}, "Shortlist deleted successfully")
    );
});

const getShortlistStatistics = asyncHandler(async (req, res) => {
    const {companyId, jobId, startDate, endDate} = req.query;

    const matchQuery = {};
    if(companyId) matchQuery.company = companyId;
    if(jobId) matchQuery.job = jobId;
    if(startDate && endDate){
        matchQuery.shortlistedDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await Shortlist.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$status',
                count: {$sum: 1}
            }
        }
    ]);

    const totalShortlists = await Shortlist.countDocuments(matchQuery);

    return res.status(200).json(
        new ApiResponse(200, {
            byStatus: stats,
            totalShortlists
        }, "Shortlist statistics fetched successfully")
    );
});

export {
    createShortlist,
    getShortlistById,
    getAllShortlists,
    getMyShortlists,
    updateShortlistStatus,
    scheduleInterview,
    addFeedback,
    deleteShortlist,
    getShortlistStatistics
};
