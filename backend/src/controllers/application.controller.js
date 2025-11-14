import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Application} from "../models/application.models.js";
import {Job} from "../models/job.models.js";
import {Student} from "../models/student.models.js";
import {Drive} from "../models/drive.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const createApplication = asyncHandler(async (req, res) => {
    const {jobId, driveId, coverLetter} = req.body;
    const studentId = req.student._id;

    if(!jobId){
        throw new ApiError(400, "Job ID is required");
    }

    const job = await Job.findById(jobId);
    if(!job){
        throw new ApiError(404, "Job not found");
    }

    if(!job.isActive || job.status !== 'Published'){
        throw new ApiError(400, "Job is not available for applications");
    }

    if(new Date() > new Date(job.applicationDeadline)){
        throw new ApiError(400, "Application deadline has passed");
    }

    const student = await Student.findById(studentId).populate('profile');
    
    // Check eligibility criteria
    if(!job.eligibilityCriteria.branches.includes(student.branch) && !job.eligibilityCriteria.branches.includes('ALL')){
        throw new ApiError(403, "You are not eligible for this job (branch criteria)");
    }

    if(student.cgpa < job.eligibilityCriteria.minCGPA){
        throw new ApiError(403, "You are not eligible for this job (CGPA criteria)");
    }

    if(!job.eligibilityCriteria.allowedBatches.includes(student.batch)){
        throw new ApiError(403, "You are not eligible for this job (batch criteria)");
    }

    if(student.profile?.activeBacklogs > job.eligibilityCriteria.maxActiveBacklogs){
        throw new ApiError(403, "You are not eligible for this job (active backlogs criteria)");
    }

    const existingApplication = await Application.findOne({
        student: studentId,
        job: jobId
    });

    if(existingApplication){
        throw new ApiError(409, "You have already applied for this job");
    }

    const resumeLocalPath = req.file?.path;
    if(!resumeLocalPath){
        throw new ApiError(400, "Resume is required");
    }

    const resumeUpload = await uploadOnCloudinary(resumeLocalPath);
    if(!resumeUpload){
        throw new ApiError(400, "Resume upload failed");
    }

    const application = await Application.create({
        student: studentId,
        job: jobId,
        drive: driveId || null,
        resumeUsed: resumeUpload.url,
        coverLetter: coverLetter || "",
        status: 'Applied'
    });

    const createdApplication = await Application.findById(application._id)
        .populate('student', 'fullName email enrollmentNumber branch batch cgpa')
        .populate('job', 'jobTitle company');

    return res.status(201).json(
        new ApiResponse(201, createdApplication, "Application submitted successfully")
    );
});

const getMyApplications = asyncHandler(async (req, res) => {
    const studentId = req.student._id;
    const {page = 1, limit = 10, status} = req.query;

    const query = {student: studentId};
    if(status) query.status = status;

    const applications = await Application.find(query)
        .populate('job', 'jobTitle company location salary jobType')
        .populate({
            path: 'job',
            populate: {
                path: 'company',
                select: 'companyName logo'
            }
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({appliedDate: -1});

    const count = await Application.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            applications,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalApplications: count
        }, "Applications fetched successfully")
    );
});

const getApplicationById = asyncHandler(async (req, res) => {
    const {applicationId} = req.params;

    if(!applicationId){
        throw new ApiError(400, "Application ID is required");
    }

    const application = await Application.findById(applicationId)
        .populate('student', 'fullName email enrollmentNumber branch batch cgpa phone avatar')
        .populate({
            path: 'job',
            populate: {
                path: 'company',
                select: 'companyName logo email website'
            }
        })
        .populate('drive', 'driveName driveDate venue');

    if(!application){
        throw new ApiError(404, "Application not found");
    }

    // Check if the requester is authorized to view this application
    if(req.student && application.student._id.toString() !== req.student._id.toString()){
        throw new ApiError(403, "You are not authorized to view this application");
    }

    return res.status(200).json(
        new ApiResponse(200, application, "Application fetched successfully")
    );
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
    const {applicationId} = req.params;
    const {status, feedback} = req.body;

    if(!applicationId){
        throw new ApiError(400, "Application ID is required");
    }

    if(!status){
        throw new ApiError(400, "Status is required");
    }

    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected', 'Withdrawn'];
    if(!validStatuses.includes(status)){
        throw new ApiError(400, "Invalid status");
    }

    const application = await Application.findById(applicationId);
    if(!application){
        throw new ApiError(404, "Application not found");
    }

    application.status = status;
    if(feedback) application.notes = feedback;
    
    await application.save();

    const updatedApplication = await Application.findById(applicationId)
        .populate('student', 'fullName email enrollmentNumber')
        .populate('job', 'jobTitle company');

    return res.status(200).json(
        new ApiResponse(200, updatedApplication, "Application status updated successfully")
    );
});

const addInterviewRound = asyncHandler(async (req, res) => {
    const {applicationId} = req.params;
    const {roundNumber, roundName, status, scheduledDate, feedback} = req.body;

    if(!applicationId || !roundNumber || !roundName){
        throw new ApiError(400, "Application ID, round number and round name are required");
    }

    const application = await Application.findById(applicationId);
    if(!application){
        throw new ApiError(404, "Application not found");
    }

    application.rounds.push({
        roundNumber,
        roundName,
        status: status || 'Pending',
        scheduledDate: scheduledDate || null,
        feedback: feedback || ""
    });

    await application.save();

    return res.status(200).json(
        new ApiResponse(200, application, "Interview round added successfully")
    );
});

const updateInterviewRound = asyncHandler(async (req, res) => {
    const {applicationId, roundId} = req.params;
    const {status, completedDate, feedback} = req.body;

    if(!applicationId || !roundId){
        throw new ApiError(400, "Application ID and Round ID are required");
    }

    const application = await Application.findById(applicationId);
    if(!application){
        throw new ApiError(404, "Application not found");
    }

    const round = application.rounds.id(roundId);
    if(!round){
        throw new ApiError(404, "Round not found");
    }

    if(status) round.status = status;
    if(completedDate) round.completedDate = completedDate;
    if(feedback) round.feedback = feedback;

    await application.save();

    return res.status(200).json(
        new ApiResponse(200, application, "Interview round updated successfully")
    );
});

const addOfferDetails = asyncHandler(async (req, res) => {
    const {applicationId} = req.params;
    const {ctc, joiningDate} = req.body;

    if(!applicationId){
        throw new ApiError(400, "Application ID is required");
    }

    const offerLetterLocalPath = req.file?.path;

    const application = await Application.findById(applicationId);
    if(!application){
        throw new ApiError(404, "Application not found");
    }

    let offerLetterUrl = null;
    if(offerLetterLocalPath){
        const offerLetter = await uploadOnCloudinary(offerLetterLocalPath);
        if(offerLetter){
            offerLetterUrl = offerLetter.url;
        }
    }

    application.offerDetails = {
        isOffered: true,
        offeredDate: Date.now(),
        ctc: ctc || null,
        joiningDate: joiningDate || null,
        offerLetterUrl: offerLetterUrl
    };

    application.status = 'Selected';
    await application.save();

    // Mark student as placed
    await Student.findByIdAndUpdate(application.student, {$set: {isPlaced: true}});

    return res.status(200).json(
        new ApiResponse(200, application, "Offer details added successfully")
    );
});

const withdrawApplication = asyncHandler(async (req, res) => {
    const {applicationId} = req.params;
    const studentId = req.student._id;

    if(!applicationId){
        throw new ApiError(400, "Application ID is required");
    }

    const application = await Application.findById(applicationId);
    if(!application){
        throw new ApiError(404, "Application not found");
    }

    if(application.student.toString() !== studentId.toString()){
        throw new ApiError(403, "You are not authorized to withdraw this application");
    }

    if(application.status === 'Selected'){
        throw new ApiError(400, "Cannot withdraw an application that has been selected");
    }

    application.status = 'Withdrawn';
    await application.save();

    return res.status(200).json(
        new ApiResponse(200, application, "Application withdrawn successfully")
    );
});

const getApplicationsByJob = asyncHandler(async (req, res) => {
    const {jobId} = req.params;
    const {page = 1, limit = 10, status, branch} = req.query;

    if(!jobId){
        throw new ApiError(400, "Job ID is required");
    }

    const query = {job: jobId};
    if(status) query.status = status;

    const applications = await Application.find(query)
        .populate({
            path: 'student',
            select: 'fullName email enrollmentNumber branch batch cgpa phone avatar',
            match: branch ? {branch: branch} : {}
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({appliedDate: -1});

    const filteredApplications = applications.filter(app => app.student !== null);

    const count = await Application.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            applications: filteredApplications,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalApplications: count
        }, "Applications fetched successfully")
    );
});

const deleteApplication = asyncHandler(async (req, res) => {
    const {applicationId} = req.params;

    if(!applicationId){
        throw new ApiError(400, "Application ID is required");
    }

    const application = await Application.findByIdAndDelete(applicationId);
    if(!application){
        throw new ApiError(404, "Application not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Application deleted successfully")
    );
});

export {
    createApplication,
    getMyApplications,
    getApplicationById,
    updateApplicationStatus,
    addInterviewRound,
    updateInterviewRound,
    addOfferDetails,
    withdrawApplication,
    getApplicationsByJob,
    deleteApplication
};
