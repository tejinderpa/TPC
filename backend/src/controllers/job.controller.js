import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Job} from "../models/job.models.js";
import {Company} from "../models/company.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const createJob = asyncHandler(async (req, res) => {
    const {
        jobTitle, jobDescription, jobType, jobCategory, location, workMode,
        salary, eligibilityCriteria, skillsRequired, applicationDeadline,
        joiningDate, numberOfOpenings, bondDetails, selectionProcess
    } = req.body;

    const companyId = req.company?._id || req.body.companyId;

    if(!jobTitle || !jobDescription || !jobType || !jobCategory || !location || !workMode){
        throw new ApiError(400, "All required job fields must be provided");
    }

    if(!salary || !salary.min || !salary.max){
        throw new ApiError(400, "Salary range is required");
    }

    if(!eligibilityCriteria){
        throw new ApiError(400, "Eligibility criteria is required");
    }

    if(!applicationDeadline || !numberOfOpenings){
        throw new ApiError(400, "Application deadline and number of openings are required");
    }

    const company = await Company.findById(companyId);
    if(!company){
        throw new ApiError(404, "Company not found");
    }

    if(!company.isVerified){
        throw new ApiError(403, "Only verified companies can post jobs");
    }

    const job = await Job.create({
        company: companyId,
        jobTitle,
        jobDescription,
        jobType,
        jobCategory,
        location,
        workMode,
        salary,
        eligibilityCriteria,
        skillsRequired: skillsRequired || [],
        applicationDeadline,
        joiningDate: joiningDate || null,
        numberOfOpenings,
        bondDetails: bondDetails || {hasBond: false},
        selectionProcess: selectionProcess || [],
        isActive: true,
        status: 'Draft',
        postedBy: req.tpo?._id || null
    });

    const createdJob = await Job.findById(job._id)
        .populate('company', 'companyName logo industry headquarters');

    return res.status(201).json(
        new ApiResponse(201, createdJob, "Job created successfully")
    );
});

const publishJob = asyncHandler(async (req, res) => {
    const {jobId} = req.params;

    if(!jobId){
        throw new ApiError(400, "Job ID is required");
    }

    const job = await Job.findById(jobId);
    if(!job){
        throw new ApiError(404, "Job not found");
    }

    if(new Date(job.applicationDeadline) < new Date()){
        throw new ApiError(400, "Cannot publish job with past application deadline");
    }

    job.status = 'Published';
    job.isActive = true;
    await job.save();

    const publishedJob = await Job.findById(jobId).populate('company', 'companyName logo');

    return res.status(200).json(
        new ApiResponse(200, publishedJob, "Job published successfully")
    );
});

const getJobById = asyncHandler(async (req, res) => {
    const {jobId} = req.params;

    if(!jobId){
        throw new ApiError(400, "Job ID is required");
    }

    const job = await Job.findById(jobId)
        .populate('company', 'companyName logo email website industry companySize headquarters description')
        .populate('postedBy', 'fullName email designation');

    if(!job){
        throw new ApiError(404, "Job not found");
    }

    return res.status(200).json(
        new ApiResponse(200, job, "Job fetched successfully")
    );
});

const getAllJobs = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, jobType, jobCategory, location, workMode, status, companyId, minSalary, maxSalary} = req.query;

    const query = {isActive: true};

    if(jobType) query.jobType = jobType;
    if(jobCategory) query.jobCategory = jobCategory;
    if(location) query.location = {$regex: location, $options: 'i'};
    if(workMode) query.workMode = workMode;
    if(status) query.status = status;
    if(companyId) query.company = companyId;
    if(minSalary) query['salary.min'] = {$gte: parseInt(minSalary)};
    if(maxSalary) query['salary.max'] = {$lte: parseInt(maxSalary)};

    const jobs = await Job.find(query)
        .populate('company', 'companyName logo industry')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({createdAt: -1});

    const count = await Job.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            jobs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalJobs: count
        }, "Jobs fetched successfully")
    );
});

const getEligibleJobs = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10} = req.query;
    const student = req.student;

    if(!student){
        throw new ApiError(401, "Student authentication required");
    }

    const query = {
        isActive: true,
        status: 'Published',
        applicationDeadline: {$gte: new Date()},
        'eligibilityCriteria.minCGPA': {$lte: student.cgpa},
        'eligibilityCriteria.allowedBatches': student.batch,
        $or: [
            {'eligibilityCriteria.branches': student.branch},
            {'eligibilityCriteria.branches': 'ALL'}
        ]
    };

    const jobs = await Job.find(query)
        .populate('company', 'companyName logo industry')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({createdAt: -1});

    const count = await Job.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            jobs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalJobs: count
        }, "Eligible jobs fetched successfully")
    );
});

const updateJob = asyncHandler(async (req, res) => {
    const {jobId} = req.params;
    const updateData = req.body;

    if(!jobId){
        throw new ApiError(400, "Job ID is required");
    }

    const job = await Job.findById(jobId);
    if(!job){
        throw new ApiError(404, "Job not found");
    }

    // Restrict updates if job is already published and has applications
    if(job.status === 'Published' && updateData.eligibilityCriteria){
        throw new ApiError(400, "Cannot modify eligibility criteria for published jobs");
    }

    const updatedJob = await Job.findByIdAndUpdate(
        jobId,
        {$set: updateData},
        {new: true, runValidators: true}
    ).populate('company', 'companyName logo');

    return res.status(200).json(
        new ApiResponse(200, updatedJob, "Job updated successfully")
    );
});

const closeJob = asyncHandler(async (req, res) => {
    const {jobId} = req.params;

    if(!jobId){
        throw new ApiError(400, "Job ID is required");
    }

    const job = await Job.findByIdAndUpdate(
        jobId,
        {$set: {status: 'Closed', isActive: false}},
        {new: true}
    ).populate('company', 'companyName logo');

    if(!job){
        throw new ApiError(404, "Job not found");
    }

    return res.status(200).json(
        new ApiResponse(200, job, "Job closed successfully")
    );
});

const deleteJob = asyncHandler(async (req, res) => {
    const {jobId} = req.params;

    if(!jobId){
        throw new ApiError(400, "Job ID is required");
    }

    const job = await Job.findByIdAndUpdate(
        jobId,
        {$set: {isActive: false}},
        {new: true}
    );

    if(!job){
        throw new ApiError(404, "Job not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Job deactivated successfully")
    );
});

const uploadJobAttachment = asyncHandler(async (req, res) => {
    const {jobId} = req.params;
    const {fileName} = req.body;

    if(!jobId){
        throw new ApiError(400, "Job ID is required");
    }

    const attachmentLocalPath = req.file?.path;
    if(!attachmentLocalPath){
        throw new ApiError(400, "Attachment file is required");
    }

    const attachment = await uploadOnCloudinary(attachmentLocalPath);
    if(!attachment){
        throw new ApiError(400, "Attachment upload failed");
    }

    const job = await Job.findById(jobId);
    if(!job){
        throw new ApiError(404, "Job not found");
    }

    job.attachments.push({
        fileName: fileName || attachment.original_filename,
        fileUrl: attachment.url
    });

    await job.save();

    return res.status(200).json(
        new ApiResponse(200, job, "Attachment uploaded successfully")
    );
});

const getJobStatistics = asyncHandler(async (req, res) => {
    const {companyId} = req.query;

    const matchQuery = {isActive: true};
    if(companyId) matchQuery.company = companyId;

    const stats = await Job.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$status',
                count: {$sum: 1},
                totalOpenings: {$sum: '$numberOfOpenings'}
            }
        }
    ]);

    const typeStats = await Job.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$jobType',
                count: {$sum: 1}
            }
        }
    ]);

    const totalJobs = await Job.countDocuments(matchQuery);

    return res.status(200).json(
        new ApiResponse(200, {
            byStatus: stats,
            byType: typeStats,
            totalJobs
        }, "Job statistics fetched successfully")
    );
});

export {
    createJob,
    publishJob,
    getJobById,
    getAllJobs,
    getEligibleJobs,
    updateJob,
    closeJob,
    deleteJob,
    uploadJobAttachment,
    getJobStatistics
};
