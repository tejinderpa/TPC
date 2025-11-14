import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Drive} from "../models/drive.models.js";
import {Company} from "../models/company.models.js";
import {Job} from "../models/job.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const createDrive = asyncHandler(async (req, res) => {
    const {
        companyId, driveName, driveType, description, driveDate, venue,
        jobs, registrationStartDate, registrationEndDate, eligibilityCriteria, instructions
    } = req.body;

    if(!companyId || !driveName || !driveType || !driveDate || !registrationStartDate || !registrationEndDate){
        throw new ApiError(400, "All required drive fields must be provided");
    }

    if(!eligibilityCriteria){
        throw new ApiError(400, "Eligibility criteria is required");
    }

    const company = await Company.findById(companyId);
    if(!company){
        throw new ApiError(404, "Company not found");
    }

    const drive = await Drive.create({
        company: companyId,
        driveName,
        driveType,
        description: description || "",
        driveDate,
        venue: venue || "",
        jobs: jobs || [],
        registrationStartDate,
        registrationEndDate,
        eligibilityCriteria,
        schedule: [],
        status: 'Upcoming',
        instructions: instructions || "",
        coordinators: req.tpo ? [req.tpo._id] : [],
        isActive: true
    });

    const createdDrive = await Drive.findById(drive._id)
        .populate('company', 'companyName logo industry')
        .populate('jobs', 'jobTitle jobType salary');

    return res.status(201).json(
        new ApiResponse(201, createdDrive, "Drive created successfully")
    );
});

const getDriveById = asyncHandler(async (req, res) => {
    const {driveId} = req.params;

    if(!driveId){
        throw new ApiError(400, "Drive ID is required");
    }

    const drive = await Drive.findById(driveId)
        .populate('company', 'companyName logo email website industry')
        .populate('jobs', 'jobTitle jobType salary location eligibilityCriteria')
        .populate('coordinators', 'fullName email designation');

    if(!drive){
        throw new ApiError(404, "Drive not found");
    }

    return res.status(200).json(
        new ApiResponse(200, drive, "Drive fetched successfully")
    );
});

const getAllDrives = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, driveType, status, companyId} = req.query;

    const query = {isActive: true};

    if(driveType) query.driveType = driveType;
    if(status) query.status = status;
    if(companyId) query.company = companyId;

    const drives = await Drive.find(query)
        .populate('company', 'companyName logo industry')
        .populate('jobs', 'jobTitle jobType')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({driveDate: -1});

    const count = await Drive.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            drives,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalDrives: count
        }, "Drives fetched successfully")
    );
});

const updateDrive = asyncHandler(async (req, res) => {
    const {driveId} = req.params;
    const updateData = req.body;

    if(!driveId){
        throw new ApiError(400, "Drive ID is required");
    }

    const drive = await Drive.findById(driveId);
    if(!drive){
        throw new ApiError(404, "Drive not found");
    }

    const updatedDrive = await Drive.findByIdAndUpdate(
        driveId,
        {$set: updateData},
        {new: true, runValidators: true}
    ).populate('company', 'companyName logo')
     .populate('jobs', 'jobTitle jobType');

    return res.status(200).json(
        new ApiResponse(200, updatedDrive, "Drive updated successfully")
    );
});

const addScheduleEvent = asyncHandler(async (req, res) => {
    const {driveId} = req.params;
    const {eventName, eventDate, eventTime, eventVenue, eventDescription} = req.body;

    if(!driveId || !eventName || !eventDate){
        throw new ApiError(400, "Drive ID, event name and event date are required");
    }

    const drive = await Drive.findById(driveId);
    if(!drive){
        throw new ApiError(404, "Drive not found");
    }

    drive.schedule.push({
        eventName,
        eventDate,
        eventTime: eventTime || "",
        eventVenue: eventVenue || "",
        eventDescription: eventDescription || ""
    });

    await drive.save();

    return res.status(200).json(
        new ApiResponse(200, drive, "Schedule event added successfully")
    );
});

const updateDriveStatus = asyncHandler(async (req, res) => {
    const {driveId} = req.params;
    const {status} = req.body;

    if(!driveId){
        throw new ApiError(400, "Drive ID is required");
    }

    if(!status){
        throw new ApiError(400, "Status is required");
    }

    const validStatuses = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];
    if(!validStatuses.includes(status)){
        throw new ApiError(400, "Invalid status");
    }

    const drive = await Drive.findByIdAndUpdate(
        driveId,
        {$set: {status}},
        {new: true}
    ).populate('company', 'companyName logo');

    if(!drive){
        throw new ApiError(404, "Drive not found");
    }

    return res.status(200).json(
        new ApiResponse(200, drive, "Drive status updated successfully")
    );
});

const updateDriveStats = asyncHandler(async (req, res) => {
    const {driveId} = req.params;
    const {totalApplicants, totalShortlisted, totalSelected} = req.body;

    if(!driveId){
        throw new ApiError(400, "Drive ID is required");
    }

    const updateFields = {};
    if(totalApplicants !== undefined) updateFields.totalApplicants = totalApplicants;
    if(totalShortlisted !== undefined) updateFields.totalShortlisted = totalShortlisted;
    if(totalSelected !== undefined) updateFields.totalSelected = totalSelected;

    const drive = await Drive.findByIdAndUpdate(
        driveId,
        {$set: updateFields},
        {new: true}
    ).populate('company', 'companyName logo');

    if(!drive){
        throw new ApiError(404, "Drive not found");
    }

    return res.status(200).json(
        new ApiResponse(200, drive, "Drive statistics updated successfully")
    );
});

const uploadDriveAttachment = asyncHandler(async (req, res) => {
    const {driveId} = req.params;
    const {fileName} = req.body;

    if(!driveId){
        throw new ApiError(400, "Drive ID is required");
    }

    const attachmentLocalPath = req.file?.path;
    if(!attachmentLocalPath){
        throw new ApiError(400, "Attachment file is required");
    }

    const attachment = await uploadOnCloudinary(attachmentLocalPath);
    if(!attachment){
        throw new ApiError(400, "Attachment upload failed");
    }

    const drive = await Drive.findById(driveId);
    if(!drive){
        throw new ApiError(404, "Drive not found");
    }

    drive.attachments.push({
        fileName: fileName || attachment.original_filename,
        fileUrl: attachment.url
    });

    await drive.save();

    return res.status(200).json(
        new ApiResponse(200, drive, "Attachment uploaded successfully")
    );
});

const deleteDrive = asyncHandler(async (req, res) => {
    const {driveId} = req.params;

    if(!driveId){
        throw new ApiError(400, "Drive ID is required");
    }

    const drive = await Drive.findByIdAndUpdate(
        driveId,
        {$set: {isActive: false}},
        {new: true}
    );

    if(!drive){
        throw new ApiError(404, "Drive not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Drive deactivated successfully")
    );
});

const getDriveStatistics = asyncHandler(async (req, res) => {
    const {companyId, startDate, endDate} = req.query;

    const matchQuery = {isActive: true};
    if(companyId) matchQuery.company = companyId;
    if(startDate && endDate){
        matchQuery.driveDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await Drive.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$status',
                count: {$sum: 1},
                totalApplicants: {$sum: '$totalApplicants'},
                totalShortlisted: {$sum: '$totalShortlisted'},
                totalSelected: {$sum: '$totalSelected'}
            }
        }
    ]);

    const typeStats = await Drive.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$driveType',
                count: {$sum: 1}
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            byStatus: stats,
            byType: typeStats
        }, "Drive statistics fetched successfully")
    );
});

export {
    createDrive,
    getDriveById,
    getAllDrives,
    updateDrive,
    addScheduleEvent,
    updateDriveStatus,
    updateDriveStats,
    uploadDriveAttachment,
    deleteDrive,
    getDriveStatistics
};
