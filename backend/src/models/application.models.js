import mongoose, {Schema} from "mongoose";

const applicationSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true
        },
        job: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true,
            index: true
        },
        drive: {
            type: Schema.Types.ObjectId,
            ref: "Drive",
            index: true
        },
        status: {
            type: String,
            enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected', 'Withdrawn'],
            default: 'Applied',
            index: true
        },
        resumeUsed: {
            type: String, // cloudinary url
            required: true
        },
        coverLetter: {
            type: String,
            trim: true
        },
        appliedDate: {
            type: Date,
            default: Date.now,
            index: true
        },
        interviewScheduled: {
            date: {
                type: Date
            },
            mode: {
                type: String,
                enum: ['Online', 'Offline', 'Hybrid']
            },
            location: {
                type: String,
                trim: true
            },
            meetingLink: {
                type: String,
                trim: true
            }
        },
        rounds: [{
            roundNumber: {
                type: Number,
                required: true
            },
            roundName: {
                type: String,
                required: true,
                trim: true
            },
            status: {
                type: String,
                enum: ['Pending', 'Cleared', 'Failed', 'Scheduled'],
                default: 'Pending'
            },
            scheduledDate: {
                type: Date
            },
            completedDate: {
                type: Date
            },
            feedback: {
                type: String,
                trim: true
            }
        }],
        offerDetails: {
            isOffered: {
                type: Boolean,
                default: false
            },
            offeredDate: {
                type: Date
            },
            ctc: {
                type: Number
            },
            joiningDate: {
                type: Date
            },
            offerLetterUrl: {
                type: String // cloudinary url
            }
        },
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Compound index for unique application per student per job
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationSchema);
