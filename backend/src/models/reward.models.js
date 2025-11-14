import mongoose, {Schema} from "mongoose";

const rewardSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true
        },
        rewardType: {
            type: String,
            required: true,
            enum: ['Profile Completion', 'Event Participation', 'Job Application', 'Interview Cleared', 'Placement', 'Referral', 'Achievement', 'Other'],
            index: true
        },
        points: {
            type: Number,
            required: true,
            min: 0
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        relatedEntity: {
            entityType: {
                type: String,
                enum: ['Event', 'Job', 'Application', 'Achievement', 'None'],
                default: 'None'
            },
            entityId: {
                type: Schema.Types.ObjectId
            }
        },
        awardedDate: {
            type: Date,
            default: Date.now,
            index: true
        },
        expiryDate: {
            type: Date
        },
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

// Index for efficient reward queries
rewardSchema.index({ student: 1, awardedDate: -1 });
rewardSchema.index({ student: 1, isActive: 1 });

export const Reward = mongoose.model("Reward", rewardSchema);
