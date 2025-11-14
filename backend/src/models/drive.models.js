import mongoose, {Schema} from "mongoose";

const driveSchema = new Schema(
    {
        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },
        driveName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        driveType: {
            type: String,
            required: true,
            enum: ['On-Campus', 'Off-Campus', 'Pool-Campus', 'Virtual'],
            index: true
        },
        description: {
            type: String,
            trim: true
        },
        driveDate: {
            type: Date,
            required: true,
            index: true
        },
        venue: {
            type: String,
            trim: true
        },
        jobs: [{
            type: Schema.Types.ObjectId,
            ref: "Job"
        }],
        registrationStartDate: {
            type: Date,
            required: true,
            index: true
        },
        registrationEndDate: {
            type: Date,
            required: true,
            index: true
        },
        eligibilityCriteria: {
            branches: [{
                type: String,
                enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'ALL']
            }],
            minCGPA: {
                type: Number,
                required: true,
                min: 0,
                max: 10
            },
            allowedBatches: [{
                type: Number
            }],
            maxActiveBacklogs: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        schedule: [{
            eventName: {
                type: String,
                required: true,
                trim: true
            },
            eventDate: {
                type: Date,
                required: true
            },
            eventTime: {
                type: String,
                trim: true
            },
            eventVenue: {
                type: String,
                trim: true
            },
            eventDescription: {
                type: String,
                trim: true
            }
        }],
        status: {
            type: String,
            required: true,
            enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
            default: 'Upcoming',
            index: true
        },
        totalApplicants: {
            type: Number,
            default: 0,
            min: 0
        },
        totalShortlisted: {
            type: Number,
            default: 0,
            min: 0
        },
        totalSelected: {
            type: Number,
            default: 0,
            min: 0
        },
        coordinators: [{
            type: Schema.Types.ObjectId,
            ref: "TPO"
        }],
        instructions: {
            type: String,
            trim: true
        },
        attachments: [{
            fileName: {
                type: String,
                trim: true
            },
            fileUrl: {
                type: String // cloudinary url
            }
        }],
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for efficient queries
driveSchema.index({ company: 1, driveDate: -1 });
driveSchema.index({ status: 1, driveDate: 1 });
driveSchema.index({ isActive: 1, status: 1 });

export const Drive = mongoose.model("Drive", driveSchema);
