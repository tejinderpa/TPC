import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Analytics} from "../models/analytics.models.js";
import {Student} from "../models/student.models.js";
import {Company} from "../models/company.models.js";
import {Job} from "../models/job.models.js";
import {Application} from "../models/application.models.js";
import {Drive} from "../models/drive.models.js";
import {Alumni} from "../models/alumni.models.js";
import {Referral} from "../models/referral.models.js";
import {EventParticipation} from "../models/eventParticipation.models.js";
import {Reward} from "../models/reward.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const generateAnalytics = asyncHandler(async (req, res) => {
    const {analyticsType, startDate, endDate} = req.body;

    if(!analyticsType || !startDate || !endDate){
        throw new ApiError(400, "Analytics type, start date and end date are required");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Student Metrics
    const totalActiveStudents = await Student.countDocuments({isActive: true});
    const newRegistrations = await Student.countDocuments({
        createdAt: {$gte: start, $lte: end}
    });
    
    const cgpaStats = await Student.aggregate([
        {$match: {isActive: true}},
        {$group: {_id: null, averageCGPA: {$avg: '$cgpa'}}}
    ]);
    
    const studentsPlaced = await Student.countDocuments({
        isActive: true,
        isPlaced: true
    });
    
    const placementRate = totalActiveStudents > 0 
        ? (studentsPlaced / totalActiveStudents) * 100 
        : 0;

    // Company Metrics
    const totalActiveCompanies = await Company.countDocuments({isActive: true});
    const newCompaniesOnboarded = await Company.countDocuments({
        createdAt: {$gte: start, $lte: end}
    });
    const companiesRecruiting = await Job.distinct('company', {
        isActive: true,
        status: 'Published'
    }).then(companies => companies.length);

    // Job Metrics
    const totalJobsPosted = await Job.countDocuments({
        createdAt: {$gte: start, $lte: end}
    });
    const activeJobs = await Job.countDocuments({
        isActive: true,
        status: 'Published',
        applicationDeadline: {$gte: new Date()}
    });
    const closedJobs = await Job.countDocuments({
        status: 'Closed',
        updatedAt: {$gte: start, $lte: end}
    });
    
    const avgApplicationsPerJob = await Application.aggregate([
        {
            $match: {
                appliedDate: {$gte: start, $lte: end}
            }
        },
        {
            $group: {
                _id: '$job',
                count: {$sum: 1}
            }
        },
        {
            $group: {
                _id: null,
                average: {$avg: '$count'}
            }
        }
    ]);

    // Application Metrics
    const totalApplications = await Application.countDocuments({
        appliedDate: {$gte: start, $lte: end}
    });
    
    const applicationsByStatus = await Application.aggregate([
        {
            $match: {
                appliedDate: {$gte: start, $lte: end}
            }
        },
        {
            $group: {
                _id: '$status',
                count: {$sum: 1}
            }
        }
    ]);
    
    const statusCounts = {};
    applicationsByStatus.forEach(item => {
        statusCounts[item._id] = item.count;
    });
    
    const conversionRate = totalApplications > 0
        ? ((statusCounts['Selected'] || 0) / totalApplications) * 100
        : 0;

    // Drive Metrics
    const totalDrives = await Drive.countDocuments({
        driveDate: {$gte: start, $lte: end}
    });
    const upcomingDrives = await Drive.countDocuments({
        status: 'Upcoming',
        driveDate: {$gte: new Date()}
    });
    const completedDrives = await Drive.countDocuments({
        status: 'Completed',
        driveDate: {$gte: start, $lte: end}
    });
    
    const avgParticipantsPerDrive = await Drive.aggregate([
        {
            $match: {
                driveDate: {$gte: start, $lte: end}
            }
        },
        {
            $group: {
                _id: null,
                average: {$avg: '$totalApplicants'}
            }
        }
    ]);

    // Alumni Metrics
    const totalAlumni = await Alumni.countDocuments({isActive: true});
    const activeAlumni = await Alumni.countDocuments({
        isActive: true,
        isVerified: true
    });
    const alumniMentors = await Alumni.countDocuments({
        isActive: true,
        isAvailableForMentorship: true
    });
    
    const totalReferrals = await Referral.countDocuments({
        referralDate: {$gte: start, $lte: end}
    });
    const successfulReferrals = await Referral.countDocuments({
        referralDate: {$gte: start, $lte: end},
        status: 'Selected'
    });

    // Engagement Metrics
    const totalEvents = await EventParticipation.distinct('eventName', {
        eventDate: {$gte: start, $lte: end}
    }).then(events => events.length);
    
    const totalEventParticipations = await EventParticipation.countDocuments({
        eventDate: {$gte: start, $lte: end}
    });
    
    const attendedCount = await EventParticipation.countDocuments({
        eventDate: {$gte: start, $lte: end},
        attendanceStatus: 'Attended'
    });
    
    const averageEventAttendance = totalEventParticipations > 0
        ? (attendedCount / totalEventParticipations) * 100
        : 0;
    
    const totalRewardsDistributed = await Reward.aggregate([
        {
            $match: {
                awardedDate: {$gte: start, $lte: end}
            }
        },
        {
            $group: {
                _id: null,
                total: {$sum: '$points'}
            }
        }
    ]);

    // Create analytics record
    const analytics = await Analytics.create({
        analyticsType,
        startDate: start,
        endDate: end,
        studentMetrics: {
            totalActiveStudents,
            newRegistrations,
            profileCompletionRate: 0, // Can be calculated based on profile data
            averageCGPA: cgpaStats.length > 0 ? cgpaStats[0].averageCGPA : 0,
            studentsPlaced,
            placementRate: parseFloat(placementRate.toFixed(2))
        },
        companyMetrics: {
            totalActiveCompanies,
            newCompaniesOnboarded,
            companiesRecruiting
        },
        jobMetrics: {
            totalJobsPosted,
            activeJobs,
            closedJobs,
            averageApplicationsPerJob: avgApplicationsPerJob.length > 0 
                ? parseFloat(avgApplicationsPerJob[0].average.toFixed(2)) 
                : 0
        },
        applicationMetrics: {
            totalApplications,
            applicationsUnderReview: statusCounts['Under Review'] || 0,
            applicationsShortlisted: statusCounts['Shortlisted'] || 0,
            applicationsRejected: statusCounts['Rejected'] || 0,
            applicationsSelected: statusCounts['Selected'] || 0,
            conversionRate: parseFloat(conversionRate.toFixed(2))
        },
        driveMetrics: {
            totalDrives,
            upcomingDrives,
            completedDrives,
            averageParticipantsPerDrive: avgParticipantsPerDrive.length > 0
                ? parseFloat(avgParticipantsPerDrive[0].average.toFixed(2))
                : 0
        },
        alumniMetrics: {
            totalAlumni,
            activeAlumni,
            alumniMentors,
            totalReferrals,
            successfulReferrals
        },
        engagementMetrics: {
            totalEvents,
            totalEventParticipations,
            averageEventAttendance: parseFloat(averageEventAttendance.toFixed(2)),
            totalRewardsDistributed: totalRewardsDistributed.length > 0 
                ? totalRewardsDistributed[0].total 
                : 0
        },
        generatedBy: req.tpo?._id || null,
        isPublic: false
    });

    const createdAnalytics = await Analytics.findById(analytics._id)
        .populate('generatedBy', 'fullName email designation');

    return res.status(201).json(
        new ApiResponse(201, createdAnalytics, "Analytics generated successfully")
    );
});

const getAnalyticsById = asyncHandler(async (req, res) => {
    const {analyticsId} = req.params;

    if(!analyticsId){
        throw new ApiError(400, "Analytics ID is required");
    }

    const analytics = await Analytics.findById(analyticsId)
        .populate('generatedBy', 'fullName email designation');

    if(!analytics){
        throw new ApiError(404, "Analytics not found");
    }

    return res.status(200).json(
        new ApiResponse(200, analytics, "Analytics fetched successfully")
    );
});

const getAllAnalytics = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, analyticsType, startDate, endDate} = req.query;

    const query = {};

    if(analyticsType) query.analyticsType = analyticsType;
    if(startDate && endDate){
        query.startDate = {$gte: new Date(startDate)};
        query.endDate = {$lte: new Date(endDate)};
    }

    const analytics = await Analytics.find(query)
        .populate('generatedBy', 'fullName email designation')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({createdAt: -1});

    const count = await Analytics.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            analytics,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalAnalytics: count
        }, "Analytics fetched successfully")
    );
});

const getLatestAnalytics = asyncHandler(async (req, res) => {
    const analytics = await Analytics.findOne()
        .sort({createdAt: -1})
        .populate('generatedBy', 'fullName email designation');

    if(!analytics){
        throw new ApiError(404, "No analytics found");
    }

    return res.status(200).json(
        new ApiResponse(200, analytics, "Latest analytics fetched successfully")
    );
});

const getDashboardSummary = asyncHandler(async (req, res) => {
    const totalStudents = await Student.countDocuments({isActive: true});
    const placedStudents = await Student.countDocuments({isActive: true, isPlaced: true});
    const activeJobs = await Job.countDocuments({isActive: true, status: 'Published'});
    const activeCompanies = await Company.countDocuments({isActive: true});
    const pendingApplications = await Application.countDocuments({status: 'Under Review'});
    const upcomingDrives = await Drive.countDocuments({status: 'Upcoming'});

    const summary = {
        students: {
            total: totalStudents,
            placed: placedStudents,
            unplaced: totalStudents - placedStudents,
            placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0
        },
        jobs: {
            active: activeJobs,
            companies: activeCompanies
        },
        applications: {
            pending: pendingApplications
        },
        drives: {
            upcoming: upcomingDrives
        }
    };

    return res.status(200).json(
        new ApiResponse(200, summary, "Dashboard summary fetched successfully")
    );
});

const updateAnalyticsVisibility = asyncHandler(async (req, res) => {
    const {analyticsId} = req.params;
    const {isPublic} = req.body;

    if(!analyticsId){
        throw new ApiError(400, "Analytics ID is required");
    }

    const analytics = await Analytics.findByIdAndUpdate(
        analyticsId,
        {$set: {isPublic: isPublic === true}},
        {new: true}
    );

    if(!analytics){
        throw new ApiError(404, "Analytics not found");
    }

    return res.status(200).json(
        new ApiResponse(200, analytics, "Analytics visibility updated successfully")
    );
});

const deleteAnalytics = asyncHandler(async (req, res) => {
    const {analyticsId} = req.params;

    if(!analyticsId){
        throw new ApiError(400, "Analytics ID is required");
    }

    const analytics = await Analytics.findByIdAndDelete(analyticsId);
    if(!analytics){
        throw new ApiError(404, "Analytics not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Analytics deleted successfully")
    );
});

export {
    generateAnalytics,
    getAnalyticsById,
    getAllAnalytics,
    getLatestAnalytics,
    getDashboardSummary,
    updateAnalyticsVisibility,
    deleteAnalytics
};
