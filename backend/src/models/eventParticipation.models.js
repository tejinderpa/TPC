import mongoose, {Schema} from "mongoose";

const eventParticipationSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true
        },
        eventName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        eventType: {
            type: String,
            required: true,
            enum: ['Workshop', 'Seminar', 'Webinar', 'Competition', 'Training', 'Mock Interview', 'Career Fair', 'Other'],
            index: true
        },
        eventDate: {
            type: Date,
            required: true,
            index: true
        },
        organizedBy: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        attendanceStatus: {
            type: String,
            enum: ['Registered', 'Attended', 'Absent', 'Cancelled'],
            default: 'Registered',
            index: true
        },
        certificateUrl: {
            type: String // cloudinary url
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
        },
        rewardPoints: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

// Compound index for efficient queries
eventParticipationSchema.index({ student: 1, eventDate: -1 });
eventParticipationSchema.index({ eventType: 1, eventDate: -1 });

export const EventParticipation = mongoose.model("EventParticipation", eventParticipationSchema);
