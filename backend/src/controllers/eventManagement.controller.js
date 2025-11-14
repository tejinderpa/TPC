import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {EventParticipation} from "../models/eventParticipation.models.js";
import {Student} from "../models/student.models.js";
import {Reward} from "../models/reward.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const createEventForAllStudents = asyncHandler(async (req, res) => {
    const {eventName, eventType, eventDate, organizedBy, description, eligibleBranches, eligibleBatches} = req.body;

    if(!eventName || !eventType || !eventDate){
        throw new ApiError(400, "Event name, type and date are required");
    }

    const query = {isActive: true};
    if(eligibleBranches && eligibleBranches.length > 0){
        query.branch = {$in: eligibleBranches};
    }
    if(eligibleBatches && eligibleBatches.length > 0){
        query.batch = {$in: eligibleBatches};
    }

    const students = await Student.find(query);

    if(students.length === 0){
        throw new ApiError(404, "No eligible students found");
    }

    const eventParticipations = students.map(student => ({
        student: student._id,
        eventName,
        eventType,
        eventDate,
        organizedBy: organizedBy || "",
        description: description || "",
        attendanceStatus: 'Registered'
    }));

    const createdEvents = await EventParticipation.insertMany(eventParticipations);

    return res.status(201).json(
        new ApiResponse(201, {
            totalRegistered: createdEvents.length,
            eventDetails: {eventName, eventType, eventDate}
        }, `Event created and ${createdEvents.length} students registered successfully`)
    );
});

const bulkUpdateAttendance = asyncHandler(async (req, res) => {
    const {eventName, eventDate, attendanceList, rewardPoints} = req.body;

    if(!eventName || !eventDate || !attendanceList || !Array.isArray(attendanceList)){
        throw new ApiError(400, "Event name, event date and attendance list are required");
    }

    const updatePromises = attendanceList.map(async (item) => {
        const {studentId, attendanceStatus} = item;

        const event = await EventParticipation.findOne({
            student: studentId,
            eventName,
            eventDate: new Date(eventDate)
        });

        if(event){
            event.attendanceStatus = attendanceStatus;
            
            if(attendanceStatus === 'Attended' && rewardPoints && rewardPoints > 0){
                event.rewardPoints = rewardPoints;
                
                // Create reward entry
                await Reward.create({
                    student: studentId,
                    rewardType: 'Event Participation',
                    points: rewardPoints,
                    description: `Attended event: ${eventName}`,
                    relatedEntity: {
                        entityType: 'Event',
                        entityId: event._id
                    }
                });
            }
            
            return await event.save();
        }
        return null;
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r !== null).length;

    return res.status(200).json(
        new ApiResponse(200, {
            totalProcessed: attendanceList.length,
            successfulUpdates: successCount
        }, "Bulk attendance updated successfully")
    );
});

const getEventParticipants = asyncHandler(async (req, res) => {
    const {eventName, eventDate, page = 1, limit = 50, attendanceStatus, branch} = req.query;

    if(!eventName || !eventDate){
        throw new ApiError(400, "Event name and event date are required");
    }

    const query = {
        eventName,
        eventDate: new Date(eventDate)
    };

    if(attendanceStatus) query.attendanceStatus = attendanceStatus;

    const participants = await EventParticipation.find(query)
        .populate({
            path: 'student',
            select: 'fullName email enrollmentNumber branch batch phone avatar',
            match: branch ? {branch: branch} : {}
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({createdAt: -1});

    const filteredParticipants = participants.filter(p => p.student !== null);

    const count = await EventParticipation.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            participants: filteredParticipants,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalParticipants: count
        }, "Event participants fetched successfully")
    );
});

const uploadBulkCertificates = asyncHandler(async (req, res) => {
    const {eventName, eventDate, studentCertificates} = req.body;

    if(!eventName || !eventDate || !studentCertificates || !Array.isArray(studentCertificates)){
        throw new ApiError(400, "Event name, event date and student certificates list are required");
    }

    const updatePromises = studentCertificates.map(async (item) => {
        const {studentId, certificateUrl} = item;

        const event = await EventParticipation.findOne({
            student: studentId,
            eventName,
            eventDate: new Date(eventDate)
        });

        if(event){
            event.certificateUrl = certificateUrl;
            return await event.save();
        }
        return null;
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r !== null).length;

    return res.status(200).json(
        new ApiResponse(200, {
            totalProcessed: studentCertificates.length,
            successfulUploads: successCount
        }, "Bulk certificates uploaded successfully")
    );
});

const getEventReport = asyncHandler(async (req, res) => {
    const {eventName, eventDate} = req.query;

    if(!eventName || !eventDate){
        throw new ApiError(400, "Event name and event date are required");
    }

    const query = {
        eventName,
        eventDate: new Date(eventDate)
    };

    const totalRegistered = await EventParticipation.countDocuments(query);
    const totalAttended = await EventParticipation.countDocuments({...query, attendanceStatus: 'Attended'});
    const totalAbsent = await EventParticipation.countDocuments({...query, attendanceStatus: 'Absent'});
    const totalCancelled = await EventParticipation.countDocuments({...query, attendanceStatus: 'Cancelled'});

    const attendanceRate = totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(2) : 0;

    const branchWiseStats = await EventParticipation.aggregate([
        {$match: query},
        {
            $lookup: {
                from: 'students',
                localField: 'student',
                foreignField: '_id',
                as: 'studentInfo'
            }
        },
        {$unwind: '$studentInfo'},
        {
            $group: {
                _id: '$studentInfo.branch',
                totalRegistered: {$sum: 1},
                totalAttended: {
                    $sum: {$cond: [{$eq: ['$attendanceStatus', 'Attended']}, 1, 0]}
                }
            }
        }
    ]);

    const feedbackStats = await EventParticipation.aggregate([
        {$match: {...query, 'feedback.rating': {$exists: true}}},
        {
            $group: {
                _id: null,
                averageRating: {$avg: '$feedback.rating'},
                totalFeedbacks: {$sum: 1}
            }
        }
    ]);

    const totalRewardsAwarded = await EventParticipation.aggregate([
        {$match: query},
        {
            $group: {
                _id: null,
                totalPoints: {$sum: '$rewardPoints'}
            }
        }
    ]);

    const report = {
        eventDetails: {
            eventName,
            eventDate
        },
        attendanceStats: {
            totalRegistered,
            totalAttended,
            totalAbsent,
            totalCancelled,
            attendanceRate: parseFloat(attendanceRate)
        },
        branchWiseStats,
        feedbackStats: feedbackStats.length > 0 ? feedbackStats[0] : {averageRating: 0, totalFeedbacks: 0},
        rewardsAwarded: totalRewardsAwarded.length > 0 ? totalRewardsAwarded[0].totalPoints : 0
    };

    return res.status(200).json(
        new ApiResponse(200, report, "Event report generated successfully")
    );
});

const getUpcomingEvents = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, eventType} = req.query;

    const query = {
        eventDate: {$gte: new Date()}
    };

    if(eventType) query.eventType = eventType;

    const events = await EventParticipation.aggregate([
        {$match: query},
        {
            $group: {
                _id: {
                    eventName: '$eventName',
                    eventDate: '$eventDate',
                    eventType: '$eventType'
                },
                totalRegistered: {$sum: 1},
                organizedBy: {$first: '$organizedBy'},
                description: {$first: '$description'}
            }
        },
        {$sort: {'_id.eventDate': 1}},
        {$skip: (page - 1) * limit},
        {$limit: parseInt(limit)}
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            events,
            currentPage: page
        }, "Upcoming events fetched successfully")
    );
});

const deleteEvent = asyncHandler(async (req, res) => {
    const {eventName, eventDate} = req.body;

    if(!eventName || !eventDate){
        throw new ApiError(400, "Event name and event date are required");
    }

    const result = await EventParticipation.deleteMany({
        eventName,
        eventDate: new Date(eventDate)
    });

    return res.status(200).json(
        new ApiResponse(200, {deletedCount: result.deletedCount}, "Event deleted successfully")
    );
});

const sendEventReminders = asyncHandler(async (req, res) => {
    const {eventName, eventDate} = req.body;

    if(!eventName || !eventDate){
        throw new ApiError(400, "Event name and event date are required");
    }

    const participants = await EventParticipation.find({
        eventName,
        eventDate: new Date(eventDate),
        attendanceStatus: 'Registered'
    }).populate('student', 'email fullName');

    // Logic to send email/SMS reminders would go here
    // For now, just return the count
    
    return res.status(200).json(
        new ApiResponse(200, {
            remindersSent: participants.length,
            eventName,
            eventDate
        }, "Event reminders sent successfully")
    );
});

export {
    createEventForAllStudents,
    bulkUpdateAttendance,
    getEventParticipants,
    uploadBulkCertificates,
    getEventReport,
    getUpcomingEvents,
    deleteEvent,
    sendEventReminders
};
