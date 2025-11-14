import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Referral} from "../models/referral.models.js";
import {Alumni} from "../models/alumni.models.js";
import {Student} from "../models/student.models.js";
import {Company} from "../models/company.models.js";
import {AlumniRewards} from "../models/alumniRewards.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const createReferral = asyncHandler(async (req, res) => {
    const {studentId, companyName, companyId, jobTitle, jobDescription, referralMessage} = req.body;
    const referrerId = req.alumni._id;

    if(!studentId || !companyName || !jobTitle){
        throw new ApiError(400, "Student ID, company name and job title are required");
    }

    const student = await Student.findById(studentId);
    if(!student){
        throw new ApiError(404, "Student not found");
    }

    const alumni = await Alumni.findById(referrerId);
    if(!alumni){
        throw new ApiError(404, "Alumni not found");
    }

    const resumeLocalPath = req.file?.path;
    if(!resumeLocalPath){
        throw new ApiError(400, "Student resume is required");
    }

    const resume = await uploadOnCloudinary(resumeLocalPath);
    if(!resume){
        throw new ApiError(400, "Resume upload failed");
    }

    const referral = await Referral.create({
        referrer: referrerId,
        student: studentId,
        company: {
            companyName,
            companyId: companyId || null
        },
        jobTitle,
        jobDescription: jobDescription || "",
        studentResume: resume.url,
        referralMessage: referralMessage || "",
        status: 'Pending'
    });

    const createdReferral = await Referral.findById(referral._id)
        .populate('referrer', 'fullName email currentCompany currentDesignation')
        .populate('student', 'fullName email enrollmentNumber branch batch cgpa');

    // Award reward points to alumni
    await AlumniRewards.create({
        alumni: referrerId,
        rewardType: 'Referral',
        points: 50,
        description: `Referred ${student.fullName} to ${companyName}`,
        relatedEntity: {
            entityType: 'Referral',
            entityId: referral._id
        }
    });

    return res.status(201).json(
        new ApiResponse(201, createdReferral, "Referral created successfully")
    );
});

const getMyReferrals = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, status} = req.query;
    const userId = req.alumni?._id || req.student?._id;
    const userType = req.alumni ? 'referrer' : 'student';

    const query = {[userType]: userId};
    if(status) query.status = status;

    const referrals = await Referral.find(query)
        .populate('referrer', 'fullName email avatar currentCompany')
        .populate('student', 'fullName email enrollmentNumber branch batch')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({referralDate: -1});

    const count = await Referral.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            referrals,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalReferrals: count
        }, "Referrals fetched successfully")
    );
});

const getAllReferrals = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, status, companyName} = req.query;

    const query = {isActive: true};
    if(status) query.status = status;
    if(companyName) query['company.companyName'] = {$regex: companyName, $options: 'i'};

    const referrals = await Referral.find(query)
        .populate('referrer', 'fullName email currentCompany currentDesignation')
        .populate('student', 'fullName email enrollmentNumber branch batch')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({referralDate: -1});

    const count = await Referral.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            referrals,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalReferrals: count
        }, "Referrals fetched successfully")
    );
});

const getReferralById = asyncHandler(async (req, res) => {
    const {referralId} = req.params;

    if(!referralId){
        throw new ApiError(400, "Referral ID is required");
    }

    const referral = await Referral.findById(referralId)
        .populate('referrer', 'fullName email phone currentCompany currentDesignation avatar')
        .populate('student', 'fullName email phone enrollmentNumber branch batch cgpa avatar');

    if(!referral){
        throw new ApiError(404, "Referral not found");
    }

    return res.status(200).json(
        new ApiResponse(200, referral, "Referral fetched successfully")
    );
});

const updateReferralStatus = asyncHandler(async (req, res) => {
    const {referralId} = req.params;
    const {status, appliedDate, interviewDate, offerDate, joiningDate} = req.body;

    if(!referralId || !status){
        throw new ApiError(400, "Referral ID and status are required");
    }

    const validStatuses = ['Pending', 'Forwarded', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'];
    if(!validStatuses.includes(status)){
        throw new ApiError(400, "Invalid status");
    }

    const referral = await Referral.findById(referralId);
    if(!referral){
        throw new ApiError(404, "Referral not found");
    }

    referral.status = status;
    
    const statusUpdate = {
        appliedDate: appliedDate || referral.applicationStatus?.appliedDate,
        interviewDate: interviewDate || referral.applicationStatus?.interviewDate,
        offerDate: offerDate || referral.applicationStatus?.offerDate,
        joiningDate: joiningDate || referral.applicationStatus?.joiningDate
    };

    referral.applicationStatus = statusUpdate;
    await referral.save();

    // Award bonus points if referral is successful
    if(status === 'Selected'){
        await AlumniRewards.create({
            alumni: referral.referrer,
            rewardType: 'Referral',
            points: 150,
            description: `Successful referral - ${referral.company.companyName}`,
            relatedEntity: {
                entityType: 'Referral',
                entityId: referral._id
            }
        });
    }

    const updatedReferral = await Referral.findById(referralId)
        .populate('referrer', 'fullName email')
        .populate('student', 'fullName email');

    return res.status(200).json(
        new ApiResponse(200, updatedReferral, "Referral status updated successfully")
    );
});

const addReferralUpdate = asyncHandler(async (req, res) => {
    const {referralId} = req.params;
    const {status, description, updatedBy} = req.body;

    if(!referralId || !description){
        throw new ApiError(400, "Referral ID and description are required");
    }

    const referral = await Referral.findById(referralId);
    if(!referral){
        throw new ApiError(404, "Referral not found");
    }

    referral.updates.push({
        date: Date.now(),
        status: status || "",
        description,
        updatedBy: updatedBy || 'System'
    });

    await referral.save();

    return res.status(200).json(
        new ApiResponse(200, referral, "Referral update added successfully")
    );
});

const addReferralFeedback = asyncHandler(async (req, res) => {
    const {referralId} = req.params;
    const {fromReferrer, fromStudent} = req.body;

    if(!referralId){
        throw new ApiError(400, "Referral ID is required");
    }

    const referral = await Referral.findById(referralId);
    if(!referral){
        throw new ApiError(404, "Referral not found");
    }

    if(fromReferrer) referral.feedback.fromReferrer = fromReferrer;
    if(fromStudent) referral.feedback.fromStudent = fromStudent;

    await referral.save();

    return res.status(200).json(
        new ApiResponse(200, referral, "Feedback added successfully")
    );
});

const withdrawReferral = asyncHandler(async (req, res) => {
    const {referralId} = req.params;

    if(!referralId){
        throw new ApiError(400, "Referral ID is required");
    }

    const referral = await Referral.findById(referralId);
    if(!referral){
        throw new ApiError(404, "Referral not found");
    }

    if(referral.status === 'Selected'){
        throw new ApiError(400, "Cannot withdraw a referral that has been selected");
    }

    referral.status = 'Withdrawn';
    referral.isActive = false;
    await referral.save();

    return res.status(200).json(
        new ApiResponse(200, referral, "Referral withdrawn successfully")
    );
});

const deleteReferral = asyncHandler(async (req, res) => {
    const {referralId} = req.params;

    if(!referralId){
        throw new ApiError(400, "Referral ID is required");
    }

    const referral = await Referral.findByIdAndUpdate(
        referralId,
        {$set: {isActive: false}},
        {new: true}
    );

    if(!referral){
        throw new ApiError(404, "Referral not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Referral deleted successfully")
    );
});

const getReferralStatistics = asyncHandler(async (req, res) => {
    const {alumniId, startDate, endDate} = req.query;

    const matchQuery = {isActive: true};
    if(alumniId) matchQuery.referrer = alumniId;
    if(startDate && endDate){
        matchQuery.referralDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await Referral.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$status',
                count: {$sum: 1}
            }
        }
    ]);

    const companyStats = await Referral.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$company.companyName',
                count: {$sum: 1}
            }
        },
        {$sort: {count: -1}},
        {$limit: 10}
    ]);

    const totalReferrals = await Referral.countDocuments(matchQuery);

    return res.status(200).json(
        new ApiResponse(200, {
            byStatus: stats,
            byCompany: companyStats,
            totalReferrals
        }, "Referral statistics fetched successfully")
    );
});

export {
    createReferral,
    getMyReferrals,
    getAllReferrals,
    getReferralById,
    updateReferralStatus,
    addReferralUpdate,
    addReferralFeedback,
    withdrawReferral,
    deleteReferral,
    getReferralStatistics
};
