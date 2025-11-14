import mongoose, {Schema} from "mongoose";

const analyticsSchema = new Schema(
    {
        analyticsType: {
            type: String,
            required: true,
            enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Custom'],
            index: true
        },
        startDate: {
            type: Date,
            required: true,
            index: true
        },
        endDate: {
            type: Date,
            required: true,
            index: true
        },
        studentMetrics: {
            totalActiveStudents: {
                type: Number,
                default: 0,
                min: 0
            },
            newRegistrations: {
                type: Number,
                default: 0,
                min: 0
            },
            profileCompletionRate: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            averageCGPA: {
                type: Number,
                default: 0,
                min: 0,
                max: 10
            },
            studentsPlaced: {
                type: Number,
                default: 0,
                min: 0
            },
            placementRate: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            }
        },
        companyMetrics: {
            totalActiveCompanies: {
                type: Number,
                default: 0,
                min: 0
            },
            newCompaniesOnboarded: {
                type: Number,
                default: 0,
                min: 0
            },
            companiesRecruiting: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        jobMetrics: {
            totalJobsPosted: {
                type: Number,
                default: 0,
                min: 0
            },
            activeJobs: {
                type: Number,
                default: 0,
                min: 0
            },
            closedJobs: {
                type: Number,
                default: 0,
                min: 0
            },
            averageApplicationsPerJob: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        applicationMetrics: {
            totalApplications: {
                type: Number,
                default: 0,
                min: 0
            },
            applicationsUnderReview: {
                type: Number,
                default: 0,
                min: 0
            },
            applicationsShortlisted: {
                type: Number,
                default: 0,
                min: 0
            },
            applicationsRejected: {
                type: Number,
                default: 0,
                min: 0
            },
            applicationsSelected: {
                type: Number,
                default: 0,
                min: 0
            },
            conversionRate: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            }
        },
        driveMetrics: {
            totalDrives: {
                type: Number,
                default: 0,
                min: 0
            },
            upcomingDrives: {
                type: Number,
                default: 0,
                min: 0
            },
            completedDrives: {
                type: Number,
                default: 0,
                min: 0
            },
            averageParticipantsPerDrive: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        alumniMetrics: {
            totalAlumni: {
                type: Number,
                default: 0,
                min: 0
            },
            activeAlumni: {
                type: Number,
                default: 0,
                min: 0
            },
            alumniMentors: {
                type: Number,
                default: 0,
                min: 0
            },
            totalReferrals: {
                type: Number,
                default: 0,
                min: 0
            },
            successfulReferrals: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        engagementMetrics: {
            totalEvents: {
                type: Number,
                default: 0,
                min: 0
            },
            totalEventParticipations: {
                type: Number,
                default: 0,
                min: 0
            },
            averageEventAttendance: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            totalRewardsDistributed: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        topPerformers: {
            topStudents: [{
                studentId: {
                    type: Schema.Types.ObjectId,
                    ref: "Student"
                },
                metric: {
                    type: String,
                    trim: true
                },
                value: {
                    type: Number
                }
            }],
            topCompanies: [{
                companyId: {
                    type: Schema.Types.ObjectId,
                    ref: "Company"
                },
                metric: {
                    type: String,
                    trim: true
                },
                value: {
                    type: Number
                }
            }]
        },
        trends: [{
            metricName: {
                type: String,
                required: true,
                trim: true
            },
            dataPoints: [{
                date: {
                    type: Date,
                    required: true
                },
                value: {
                    type: Number,
                    required: true
                }
            }],
            trend: {
                type: String,
                enum: ['Increasing', 'Decreasing', 'Stable', 'Fluctuating']
            },
            percentageChange: {
                type: Number
            }
        }],
        generatedBy: {
            type: Schema.Types.ObjectId,
            ref: "TPO"
        },
        isPublic: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for efficient queries
analyticsSchema.index({ analyticsType: 1, startDate: -1 });
analyticsSchema.index({ startDate: 1, endDate: 1 });

export const Analytics = mongoose.model("Analytics", analyticsSchema);
