import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {EventParticipation} from "../models/eventParticipation.models.js";
import {Student} from "../models/student.models.js";
import {Reward} from "../models/reward.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const createEvent = asyncHandler(async (req, res) => {
    const {eventName, eventType, eventDate, organizedBy, description} = req.body;

    if(!eventName || !eventType || !eventDate){
        throw new ApiError(400, "Event name, type and date are required");
    }

    const validEventTypes = ['Workshop', 'Seminar', 'Webinar', 'Competition', 'Training', 'Mock Interview', 'Career Fair', 'Other'];
    if(!validEventTypes.includes(eventType)){
        throw new ApiError(400, "Invalid event type");
    }

    return res.status(200).json(
        new ApiResponse(200, {eventName, eventType, eventDate}, "Event details validated")
    );
});

const registerForEvent = asyncHandler(async (req, res) => {
    const {eventName, eventType, eventDate, organizedBy, description} = req.body;
    const studentId = req.student._id;

    if(!eventName || !eventType || !eventDate){
        throw new ApiError(400, "Event name, type and date are required");
    }

    const student = await Student.findById(studentId);
    if(!student){
        throw new ApiError(404, "Student not found");
    }

    const existingRegistration = await EventParticipation.findOne({
        student: studentId,
        eventName: eventName,
        eventDate: eventDate
    });

    if(existingRegistration){
        throw new ApiError(409, "You have already registered for this event");
    }

    const eventParticipation = await EventParticipation.create({
        student: studentId,
        eventName,
        eventType,
        eventDate,
        organizedBy: organizedBy || "",
        description: description || "",
        attendanceStatus: 'Registered'
    });

    const createdEvent = await EventParticipation.findById(eventParticipation._id)
        .populate('student', 'fullName email enrollmentNumber branch batch');

    return res.status(201).json(
        new ApiResponse(201, createdEvent, "Registered for event successfully")
    );
});

const getMyEvents = asyncHandler(async (req, res) => {
    const studentId = req.student._id;
    const {page = 1, limit = 10, eventType, attendanceStatus} = req.query;

    const query = {student: studentId};
    if(eventType) query.eventType = eventType;
    if(attendanceStatus) query.attendanceStatus = attendanceStatus;

    const events = await EventParticipation.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({eventDate: -1});

    const count = await EventParticipation.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            events,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalEvents: count
        }, "Events fetched successfully")
    );
});

const getAllEvents = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, eventType, attendanceStatus, startDate, endDate} = req.query;

    const query = {};
    if(eventType) query.eventType = eventType;
    if(attendanceStatus) query.attendanceStatus = attendanceStatus;
    if(startDate && endDate){
        query.eventDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const events = await EventParticipation.find(query)
        .populate('student', 'fullName email enrollmentNumber branch batch')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({eventDate: -1});

    const count = await EventParticipation.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            events,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalEvents: count
        }, "Events fetched successfully")
    );
});

const getEventById = asyncHandler(async (req, res) => {
    const {eventId} = req.params;

    if(!eventId){
        throw new ApiError(400, "Event ID is required");
    }

    const event = await EventParticipation.findById(eventId)
        .populate('student', 'fullName email enrollmentNumber branch batch phone');

    if(!event){
        throw new ApiError(404, "Event not found");
    }

    return res.status(200).json(
        new ApiResponse(200, event, "Event fetched successfully")
    );
});

const updateAttendanceStatus = asyncHandler(async (req, res) => {
    const {eventId} = req.params;
    const {attendanceStatus, rewardPoints} = req.body;

    if(!eventId){
        throw new ApiError(400, "Event ID is required");
    }

    if(!attendanceStatus){
        throw new ApiError(400, "Attendance status is required");
    }

    const validStatuses = ['Registered', 'Attended', 'Absent', 'Cancelled'];
    if(!validStatuses.includes(attendanceStatus)){
        throw new ApiError(400, "Invalid attendance status");
    }

    const event = await EventParticipation.findById(eventId);
    if(!event){
        throw new ApiError(404, "Event not found");
    }

    event.attendanceStatus = attendanceStatus;
    
    // Award reward points if attended
    if(attendanceStatus === 'Attended' && rewardPoints && rewardPoints > 0){
        event.rewardPoints = rewardPoints;
        
        // Create reward entry
        await Reward.create({
            student: event.student,
            rewardType: 'Event Participation',
            points: rewardPoints,
            description: `Attended event: ${event.eventName}`,
            relatedEntity: {
                entityType: 'Event',
                entityId: event._id
            }
        });
    }

    await event.save();

    const updatedEvent = await EventParticipation.findById(eventId)
        .populate('student', 'fullName email enrollmentNumber');

    return res.status(200).json(
        new ApiResponse(200, updatedEvent, "Attendance status updated successfully")
    );
});

const uploadEventCertificate = asyncHandler(async (req, res) => {
    const {eventId} = req.params;

    if(!eventId){
        throw new ApiError(400, "Event ID is required");
    }

    const certificateLocalPath = req.file?.path;
    if(!certificateLocalPath){
        throw new ApiError(400, "Certificate file is required");
    }

    const certificate = await uploadOnCloudinary(certificateLocalPath);
    if(!certificate){
        throw new ApiError(400, "Certificate upload failed");
    }

    const event = await EventParticipation.findByIdAndUpdate(
        eventId,
        {$set: {certificateUrl: certificate.url}},
        {new: true}
    ).populate('student', 'fullName email');

    if(!event){
        throw new ApiError(404, "Event not found");
    }

    return res.status(200).json(
        new ApiResponse(200, event, "Certificate uploaded successfully")
    );
});

const submitEventFeedback = asyncHandler(async (req, res) => {
    const {eventId} = req.params;
    const {rating, comments} = req.body;

    if(!eventId){
        throw new ApiError(400, "Event ID is required");
    }

    if(!rating){
        throw new ApiError(400, "Rating is required");
    }

    if(rating < 1 || rating > 5){
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    const event = await EventParticipation.findById(eventId);
    if(!event){
        throw new ApiError(404, "Event not found");
    }

    if(event.student.toString() !== req.student._id.toString()){
        throw new ApiError(403, "You are not authorized to submit feedback for this event");
    }

    event.feedback = {
        rating,
        comments: comments || ""
    };

    await event.save();

    return res.status(200).json(
        new ApiResponse(200, event, "Feedback submitted successfully")
    );
});

const cancelEventRegistration = asyncHandler(async (req, res) => {
    const {eventId} = req.params;
    const studentId = req.student._id;

    if(!eventId){
        throw new ApiError(400, "Event ID is required");
    }

    const event = await EventParticipation.findById(eventId);
    if(!event){
        throw new ApiError(404, "Event not found");
    }

    if(event.student.toString() !== studentId.toString()){
        throw new ApiError(403, "You are not authorized to cancel this registration");
    }

    if(event.attendanceStatus === 'Attended'){
        throw new ApiError(400, "Cannot cancel registration for an attended event");
    }

    event.attendanceStatus = 'Cancelled';
    await event.save();

    return res.status(200).json(
        new ApiResponse(200, event, "Event registration cancelled successfully")
    );
});

const deleteEvent = asyncHandler(async (req, res) => {
    const {eventId} = req.params;

    if(!eventId){
        throw new ApiError(400, "Event ID is required");
    }

    const event = await EventParticipation.findByIdAndDelete(eventId);
    if(!event){
        throw new ApiError(404, "Event not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Event deleted successfully")
    );
});

const getEventStatistics = asyncHandler(async (req, res) => {
    const {startDate, endDate} = req.query;

    const matchQuery = {};
    if(startDate && endDate){
        matchQuery.eventDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await EventParticipation.aggregate([
        {$match: matchQuery},
        {
            $group: {
                _id: '$eventType',
                totalEvents: {$sum: 1},
                totalAttended: {
                    $sum: {$cond: [{$eq: ['$attendanceStatus', 'Attended']}, 1, 0]}
                },
                totalRegistered: {
                    $sum: {$cond: [{$eq: ['$attendanceStatus', 'Registered']}, 1, 0]}
                },
                totalRewardPoints: {$sum: '$rewardPoints'},
                averageRating: {$avg: '$feedback.rating'}
            }
        },
        {$sort: {totalEvents: -1}}
    ]);

    return res.status(200).json(
        new ApiResponse(200, stats, "Event statistics fetched successfully")
    );
});

export {
    createEvent,
    registerForEvent,
    getMyEvents,
    getAllEvents,
    getEventById,
    updateAttendanceStatus,
    uploadEventCertificate,
    submitEventFeedback,
    cancelEventRegistration,
    deleteEvent,
    getEventStatistics
};
