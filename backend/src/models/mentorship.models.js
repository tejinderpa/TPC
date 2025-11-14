import mongoose, {Schema} from "mongoose";

const mentorshipSchema = new Schema(
    {
        mentor: {
            type: Schema.Types.ObjectId,
            ref: "Alumni",
            required: true,
            index: true
        },
        mentee: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true
        },
        mentorshipType: {
            type: String,
            required: true,
            enum: ['Career Guidance', 'Technical Skills', 'Interview Preparation', 'Project Guidance', 'General', 'Other'],
            index: true
        },
        status: {
            type: String,
            required: true,
            enum: ['Requested', 'Accepted', 'Ongoing', 'Completed', 'Rejected', 'Cancelled'],
            default: 'Requested',
            index: true
        },
        requestMessage: {
            type: String,
            required: true,
            trim: true
        },
        responseMessage: {
            type: String,
            trim: true
        },
        startDate: {
            type: Date,
            index: true
        },
        endDate: {
            type: Date
        },
        sessions: [{
            sessionDate: {
                type: Date,
                required: true
            },
            duration: {
                type: Number, // in minutes
                required: true,
                min: 0
            },
            mode: {
                type: String,
                enum: ['Online', 'Offline', 'Phone'],
                required: true
            },
            topic: {
                type: String,
                trim: true
            },
            notes: {
                type: String,
                trim: true
            },
            feedback: {
                rating: {
                    type: Number,
                    min: 1,
                    max: 5
                },
                comments: {
                    type: String,
                    trim: true
                }
            }
        }],
        goals: [{
            description: {
                type: String,
                required: true,
                trim: true
            },
            targetDate: {
                type: Date
            },
            status: {
                type: String,
                enum: ['Pending', 'In Progress', 'Achieved', 'Cancelled'],
                default: 'Pending'
            },
            achievedDate: {
                type: Date
            }
        }],
        overallFeedback: {
            mentorRating: {
                type: Number,
                min: 1,
                max: 5
            },
            mentorComments: {
                type: String,
                trim: true
            },
            menteeRating: {
                type: Number,
                min: 1,
                max: 5
            },
            menteeComments: {
                type: String,
                trim: true
            }
        },
        totalSessions: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for efficient queries
mentorshipSchema.index({ mentor: 1, status: 1 });
mentorshipSchema.index({ mentee: 1, status: 1 });
mentorshipSchema.index({ mentor: 1, mentee: 1 });

export const Mentorship = mongoose.model("Mentorship", mentorshipSchema);
