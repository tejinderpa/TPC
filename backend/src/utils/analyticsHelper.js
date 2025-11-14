import { Student } from '../models/student.models.js';
import { Company } from '../models/company.models.js';
import { Job } from '../models/job.models.js';
import { Application } from '../models/application.models.js';
import { Drive } from '../models/drive.models.js';
import { Alumni } from '../models/alumni.models.js';
import { Referral } from '../models/referral.models.js';
import { EventParticipation } from '../models/eventParticipation.models.js';
import { Reward } from '../models/reward.models.js';

// Generate student metrics
export const generateStudentMetrics = async (startDate, endDate, branch = null, batch = null) => {
    const query = { isActive: true };
    if (branch) query.branch = branch;
    if (batch) query.batch = batch;

    const totalActiveStudents = await Student.countDocuments(query);
    
    const newQuery = { ...query, createdAt: { $gte: startDate, $lte: endDate } };
    const newRegistrations = await Student.countDocuments(newQuery);

    const cgpaStats = await Student.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                averageCGPA: { $avg: '$cgpa' },
                maxCGPA: { $max: '$cgpa' },
                minCGPA: { $min: '$cgpa' },
            },
        },
    ]);

    const studentsPlaced = await Student.countDocuments({ ...query, isPlaced: true });
    const placementRate = totalActiveStudents > 0 ? (studentsPlaced / totalActiveStudents) * 100 : 0;

    const branchWiseStats = await Student.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$branch',
                total: { $sum: 1 },
                placed: { $sum: { $cond: ['$isPlaced', 1, 0] } },
                averageCGPA: { $avg: '$cgpa' },
            },
        },
        {
            $project: {
                branch: '$_id',
                total: 1,
                placed: 1,
                placementRate: {
                    $multiply: [{ $divide: ['$placed', '$total'] }, 100],
                },
                averageCGPA: { $round: ['$averageCGPA', 2] },
            },
        },
        { $sort: { placementRate: -1 } },
    ]);

    return {
        totalActiveStudents,
        newRegistrations,
        cgpaStatistics: cgpaStats.length > 0 ? cgpaStats[0] : { averageCGPA: 0, maxCGPA: 0, minCGPA: 0 },
        studentsPlaced,
        placementRate: parseFloat(placementRate.toFixed(2)),
        branchWiseStats,
    };
};

// Generate company metrics
export const generateCompanyMetrics = async (startDate, endDate) => {
    const totalActiveCompanies = await Company.countDocuments({ isActive: true });
    const newCompaniesOnboarded = await Company.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
    });
    const verifiedCompanies = await Company.countDocuments({ isActive: true, isVerified: true });

    const companiesRecruiting = await Job.distinct('company', {
        isActive: true,
        status: 'Published',
    }).then(companies => companies.length);

    const topRecruiters = await Application.aggregate([
        {
            $match: {
                appliedDate: { $gte: startDate, $lte: endDate },
                status: 'Selected',
            },
        },
        {
            $lookup: {
                from: 'jobs',
                localField: 'job',
                foreignField: '_id',
                as: 'jobInfo',
            },
        },
        { $unwind: '$jobInfo' },
        {
            $lookup: {
                from: 'companies',
                localField: 'jobInfo.company',
                foreignField: '_id',
                as: 'companyInfo',
            },
        },
        { $unwind: '$companyInfo' },
        {
            $group: {
                _id: '$companyInfo._id',
                companyName: { $first: '$companyInfo.companyName' },
                totalHires: { $sum: 1 },
            },
        },
        { $sort: { totalHires: -1 } },
        { $limit: 10 },
    ]);

    return {
        totalActiveCompanies,
        newCompaniesOnboarded,
        verifiedCompanies,
        companiesRecruiting,
        topRecruiters,
    };
};

// Generate job metrics
export const generateJobMetrics = async (startDate, endDate) => {
    const totalJobsPosted = await Job.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
    });

    const activeJobs = await Job.countDocuments({
        isActive: true,
        status: 'Published',
        applicationDeadline: { $gte: new Date() },
    });

    const closedJobs = await Job.countDocuments({
        status: 'Closed',
        updatedAt: { $gte: startDate, $lte: endDate },
    });

    const jobsByType = await Job.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: '$jobType',
                count: { $sum: 1 },
            },
        },
    ]);

    const avgApplicationsPerJob = await Application.aggregate([
        {
            $match: {
                appliedDate: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: '$job',
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: null,
                average: { $avg: '$count' },
            },
        },
    ]);

    const salaryStats = await Job.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                isActive: true,
            },
        },
        {
            $group: {
                _id: null,
                averageSalary: { $avg: '$salaryPackage' },
                maxSalary: { $max: '$salaryPackage' },
                minSalary: { $min: '$salaryPackage' },
            },
        },
    ]);

    return {
        totalJobsPosted,
        activeJobs,
        closedJobs,
        jobsByType,
        averageApplicationsPerJob: avgApplicationsPerJob.length > 0 ? parseFloat(avgApplicationsPerJob[0].average.toFixed(2)) : 0,
        salaryStatistics: salaryStats.length > 0 ? salaryStats[0] : { averageSalary: 0, maxSalary: 0, minSalary: 0 },
    };
};

// Generate application metrics
export const generateApplicationMetrics = async (startDate, endDate) => {
    const totalApplications = await Application.countDocuments({
        appliedDate: { $gte: startDate, $lte: endDate },
    });

    const applicationsByStatus = await Application.aggregate([
        {
            $match: {
                appliedDate: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const statusCounts = {};
    applicationsByStatus.forEach(item => {
        statusCounts[item._id] = item.count;
    });

    const conversionRate = totalApplications > 0 ? ((statusCounts['Selected'] || 0) / totalApplications) * 100 : 0;

    const avgInterviewRounds = await Application.aggregate([
        {
            $match: {
                appliedDate: { $gte: startDate, $lte: endDate },
                interviewRounds: { $exists: true, $ne: [] },
            },
        },
        {
            $project: {
                roundCount: { $size: '$interviewRounds' },
            },
        },
        {
            $group: {
                _id: null,
                average: { $avg: '$roundCount' },
            },
        },
    ]);

    return {
        totalApplications,
        applicationsByStatus: statusCounts,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        averageInterviewRounds: avgInterviewRounds.length > 0 ? parseFloat(avgInterviewRounds[0].average.toFixed(2)) : 0,
    };
};

// Generate drive metrics
export const generateDriveMetrics = async (startDate, endDate) => {
    const totalDrives = await Drive.countDocuments({
        driveDate: { $gte: startDate, $lte: endDate },
    });

    const upcomingDrives = await Drive.countDocuments({
        status: 'Upcoming',
        driveDate: { $gte: new Date() },
    });

    const completedDrives = await Drive.countDocuments({
        status: 'Completed',
        driveDate: { $gte: startDate, $lte: endDate },
    });

    const avgParticipantsPerDrive = await Drive.aggregate([
        {
            $match: {
                driveDate: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: null,
                average: { $avg: '$totalApplicants' },
            },
        },
    ]);

    return {
        totalDrives,
        upcomingDrives,
        completedDrives,
        averageParticipantsPerDrive: avgParticipantsPerDrive.length > 0 ? parseFloat(avgParticipantsPerDrive[0].average.toFixed(2)) : 0,
    };
};

// Generate alumni and referral metrics
export const generateAlumniMetrics = async (startDate, endDate) => {
    const totalAlumni = await Alumni.countDocuments({ isActive: true });
    const activeAlumni = await Alumni.countDocuments({ isActive: true, isVerified: true });
    const alumniMentors = await Alumni.countDocuments({ isActive: true, isAvailableForMentorship: true });

    const totalReferrals = await Referral.countDocuments({
        referralDate: { $gte: startDate, $lte: endDate },
    });

    const successfulReferrals = await Referral.countDocuments({
        referralDate: { $gte: startDate, $lte: endDate },
        status: 'Selected',
    });

    const referralSuccessRate = totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0;

    return {
        totalAlumni,
        activeAlumni,
        alumniMentors,
        totalReferrals,
        successfulReferrals,
        referralSuccessRate: parseFloat(referralSuccessRate.toFixed(2)),
    };
};

// Generate engagement metrics
export const generateEngagementMetrics = async (startDate, endDate) => {
    const totalEvents = await EventParticipation.distinct('eventName', {
        eventDate: { $gte: startDate, $lte: endDate },
    }).then(events => events.length);

    const totalEventParticipations = await EventParticipation.countDocuments({
        eventDate: { $gte: startDate, $lte: endDate },
    });

    const attendedCount = await EventParticipation.countDocuments({
        eventDate: { $gte: startDate, $lte: endDate },
        attendanceStatus: 'Attended',
    });

    const averageEventAttendance = totalEventParticipations > 0 ? (attendedCount / totalEventParticipations) * 100 : 0;

    const totalRewardsDistributed = await Reward.aggregate([
        {
            $match: {
                awardedDate: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$points' },
            },
        },
    ]);

    const eventsByType = await EventParticipation.aggregate([
        {
            $match: {
                eventDate: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: '$eventType',
                count: { $sum: 1 },
            },
        },
    ]);

    return {
        totalEvents,
        totalEventParticipations,
        averageEventAttendance: parseFloat(averageEventAttendance.toFixed(2)),
        totalRewardsDistributed: totalRewardsDistributed.length > 0 ? totalRewardsDistributed[0].total : 0,
        eventsByType,
    };
};

// Generate comprehensive analytics
export const generateComprehensiveAnalytics = async (startDate, endDate, filters = {}) => {
    const studentMetrics = await generateStudentMetrics(startDate, endDate, filters.branch, filters.batch);
    const companyMetrics = await generateCompanyMetrics(startDate, endDate);
    const jobMetrics = await generateJobMetrics(startDate, endDate);
    const applicationMetrics = await generateApplicationMetrics(startDate, endDate);
    const driveMetrics = await generateDriveMetrics(startDate, endDate);
    const alumniMetrics = await generateAlumniMetrics(startDate, endDate);
    const engagementMetrics = await generateEngagementMetrics(startDate, endDate);

    return {
        period: {
            startDate,
            endDate,
        },
        studentMetrics,
        companyMetrics,
        jobMetrics,
        applicationMetrics,
        driveMetrics,
        alumniMetrics,
        engagementMetrics,
        generatedAt: new Date(),
    };
};

export default {
    generateStudentMetrics,
    generateCompanyMetrics,
    generateJobMetrics,
    generateApplicationMetrics,
    generateDriveMetrics,
    generateAlumniMetrics,
    generateEngagementMetrics,
    generateComprehensiveAnalytics,
};
