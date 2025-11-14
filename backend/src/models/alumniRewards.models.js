import mongoose, {Schema} from "mongoose";

const alumniRewardsSchema = new Schema(
    {
        alumni: {
            type: Schema.Types.ObjectId,
            ref: "Alumni",
            required: true,
            index: true
        },
        rewardType: {
            type: String,
            required: true,
            enum: ['Mentorship', 'Referral', 'Guest Lecture', 'Workshop', 'Donation', 'Event Participation', 'Recognition', 'Other'],
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
                enum: ['Mentorship', 'Referral', 'Event', 'None'],
                default: 'None'
            },
            entityId: {
                type: Schema.Types.ObjectId
            }
        },
        badge: {
            badgeName: {
                type: String,
                trim: true
            },
            badgeIcon: {
                type: String // cloudinary url
            },
            badgeLevel: {
                type: String,
                enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
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
        isRedeemed: {
            type: Boolean,
            default: false,
            index: true
        },
        redemptionDetails: {
            redeemedDate: {
                type: Date
            },
            redemptionType: {
                type: String,
                enum: ['Gift', 'Certificate', 'Recognition', 'Other']
            },
            redemptionValue: {
                type: Number,
                min: 0
            },
            description: {
                type: String,
                trim: true
            }
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

// Compound indexes for efficient queries
alumniRewardsSchema.index({ alumni: 1, awardedDate: -1 });
alumniRewardsSchema.index({ alumni: 1, isActive: 1 });
alumniRewardsSchema.index({ alumni: 1, isRedeemed: 1 });
alumniRewardsSchema.index({ rewardType: 1, awardedDate: -1 });

export const AlumniRewards = mongoose.model("AlumniRewards", alumniRewardsSchema);
