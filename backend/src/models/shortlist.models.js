import mongoose, {Schema} from "mongoose";

const shortlistSchema = new Schema(
    {
        application: {
            type: Schema.Types.ObjectId,
            ref: "Application",
            required: true,
            unique: true,
            index: true
        },
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
        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },
        drive: {
            type: Schema.Types.ObjectId,
            ref: "Drive",
            index: true
        },
        shortlistedFor: {
            type: String,
            required: true,
            enum: ['Interview', 'Technical Round', 'HR Round', 'Final Round', 'Assessment', 'Other'],
            index: true
        },
        shortlistedDate: {
            type: Date,
            default: Date.now,
            index: true
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Confirmed', 'Rejected', 'Selected', 'On-Hold'],
            default: 'Pending',
            index: true
        },
        interviewDetails: {
            scheduledDate: {
                type: Date
            },
            scheduledTime: {
                type: String,
                trim: true
            },
            venue: {
                type: String,
                trim: true
            },
            mode: {
                type: String,
                enum: ['Online', 'Offline', 'Hybrid']
            },
            meetingLink: {
                type: String,
                trim: true
            },
            panelMembers: [{
                type: String,
                trim: true
            }],
            duration: {
                type: Number, // in minutes
                min: 0
            }
        },
        feedback: {
            rating: {
                type: Number,
                min: 1,
                max: 10
            },
            comments: {
                type: String,
                trim: true
            },
            strengths: [{
                type: String,
                trim: true
            }],
            weaknesses: [{
                type: String,
                trim: true
            }],
            recommendation: {
                type: String,
                enum: ['Strongly Recommend', 'Recommend', 'Maybe', 'Not Recommend']
            }
        },
        notificationSent: {
            type: Boolean,
            default: false,
            index: true
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

// Compound indexes for efficient queries
shortlistSchema.index({ student: 1, job: 1 });
shortlistSchema.index({ company: 1, shortlistedDate: -1 });
shortlistSchema.index({ status: 1, shortlistedDate: -1 });

export const Shortlist = mongoose.model("Shortlist", shortlistSchema);
