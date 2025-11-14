import mongoose, {Schema} from "mongoose";

const jobSchema = new Schema(
    {
        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },
        jobTitle: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        jobDescription: {
            type: String,
            required: true,
            trim: true
        },
        jobType: {
            type: String,
            required: true,
            enum: ['Full-Time', 'Internship', 'Part-Time', 'Contract'],
            index: true
        },
        jobCategory: {
            type: String,
            required: true,
            enum: ['Software', 'Hardware', 'Core', 'Consulting', 'Finance', 'Analytics', 'Other'],
            index: true
        },
        location: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        workMode: {
            type: String,
            required: true,
            enum: ['On-site', 'Remote', 'Hybrid'],
            index: true
        },
        salary: {
            min: {
                type: Number,
                required: true,
                min: 0
            },
            max: {
                type: Number,
                required: true,
                min: 0
            },
            currency: {
                type: String,
                default: 'INR'
            }
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
            minTenthPercentage: {
                type: Number,
                min: 0,
                max: 100
            },
            minTwelfthPercentage: {
                type: Number,
                min: 0,
                max: 100
            },
            maxActiveBacklogs: {
                type: Number,
                default: 0,
                min: 0
            },
            allowedBatches: [{
                type: Number
            }]
        },
        skillsRequired: [{
            type: String,
            trim: true
        }],
        applicationDeadline: {
            type: Date,
            required: true,
            index: true
        },
        joiningDate: {
            type: Date
        },
        numberOfOpenings: {
            type: Number,
            required: true,
            min: 1
        },
        bondDetails: {
            hasBond: {
                type: Boolean,
                default: false
            },
            bondDuration: {
                type: Number, // in months
                min: 0
            },
            bondAmount: {
                type: Number,
                min: 0
            }
        },
        selectionProcess: [{
            round: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                trim: true
            }
        }],
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
        },
        status: {
            type: String,
            enum: ['Draft', 'Published', 'Closed', 'Cancelled'],
            default: 'Draft',
            index: true
        },
        postedBy: {
            type: Schema.Types.ObjectId,
            ref: "TPO",
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Index for active jobs
jobSchema.index({ isActive: 1, status: 1, applicationDeadline: 1 });
jobSchema.index({ company: 1, createdAt: -1 });

export const Job = mongoose.model("Job", jobSchema);
