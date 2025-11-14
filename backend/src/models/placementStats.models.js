import mongoose, {Schema} from "mongoose";

const placementStatsSchema = new Schema(
    {
        academicYear: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        batch: {
            type: Number,
            required: true,
            index: true
        },
        branch: {
            type: String,
            required: true,
            enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'ALL'],
            index: true
        },
        totalStudents: {
            type: Number,
            required: true,
            min: 0
        },
        eligibleStudents: {
            type: Number,
            required: true,
            min: 0
        },
        studentsPlaced: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        studentsWithMultipleOffers: {
            type: Number,
            default: 0,
            min: 0
        },
        totalOffers: {
            type: Number,
            default: 0,
            min: 0
        },
        placementPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        salaryStats: {
            highest: {
                type: Number,
                default: 0,
                min: 0
            },
            average: {
                type: Number,
                default: 0,
                min: 0
            },
            median: {
                type: Number,
                default: 0,
                min: 0
            },
            lowest: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        companiesParticipated: {
            type: Number,
            default: 0,
            min: 0
        },
        drivesOrganized: {
            type: Number,
            default: 0,
            min: 0
        },
        sectorWiseBreakdown: [{
            sector: {
                type: String,
                required: true,
                trim: true
            },
            companiesCount: {
                type: Number,
                default: 0,
                min: 0
            },
            studentsPlaced: {
                type: Number,
                default: 0,
                min: 0
            },
            averageSalary: {
                type: Number,
                default: 0,
                min: 0
            }
        }],
        jobTypeBreakdown: {
            fullTime: {
                type: Number,
                default: 0,
                min: 0
            },
            internship: {
                type: Number,
                default: 0,
                min: 0
            },
            contract: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        topRecruiters: [{
            companyId: {
                type: Schema.Types.ObjectId,
                ref: "Company"
            },
            companyName: {
                type: String,
                required: true,
                trim: true
            },
            studentsHired: {
                type: Number,
                required: true,
                min: 0
            },
            averageSalary: {
                type: Number,
                min: 0
            }
        }],
        cgpaWiseBreakdown: [{
            cgpaRange: {
                type: String,
                required: true,
                trim: true
            },
            studentsCount: {
                type: Number,
                default: 0,
                min: 0
            },
            placedCount: {
                type: Number,
                default: 0,
                min: 0
            },
            placementPercentage: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            }
        }],
        lastUpdated: {
            type: Date,
            default: Date.now,
            index: true
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "TPO"
        }
    },
    {
        timestamps: true
    }
);

// Compound unique index
placementStatsSchema.index({ academicYear: 1, batch: 1, branch: 1 }, { unique: true });

// Pre-save hook to calculate placement percentage
placementStatsSchema.pre('save', function(next) {
    if(this.eligibleStudents > 0) {
        this.placementPercentage = (this.studentsPlaced / this.eligibleStudents) * 100;
        this.placementPercentage = Math.round(this.placementPercentage * 100) / 100;
    }
    this.lastUpdated = Date.now();
    next();
});

export const PlacementStats = mongoose.model("PlacementStats", placementStatsSchema);
