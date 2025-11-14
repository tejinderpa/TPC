import mongoose, {Schema} from "mongoose";

const referralSchema = new Schema(
    {
        referrer: {
            type: Schema.Types.ObjectId,
            ref: "Alumni",
            required: true,
            index: true
        },
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true
        },
        company: {
            companyName: {
                type: String,
                required: true,
                trim: true,
                index: true
            },
            companyId: {
                type: Schema.Types.ObjectId,
                ref: "Company"
            }
        },
        jobTitle: {
            type: String,
            required: true,
            trim: true
        },
        jobDescription: {
            type: String,
            trim: true
        },
        referralDate: {
            type: Date,
            default: Date.now,
            index: true
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Forwarded', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'],
            default: 'Pending',
            index: true
        },
        referralCode: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            index: true
        },
        studentResume: {
            type: String, // cloudinary url
            required: true
        },
        referralMessage: {
            type: String,
            trim: true
        },
        applicationStatus: {
            appliedDate: {
                type: Date
            },
            interviewDate: {
                type: Date
            },
            offerDate: {
                type: Date
            },
            joiningDate: {
                type: Date
            }
        },
        feedback: {
            fromReferrer: {
                type: String,
                trim: true
            },
            fromStudent: {
                type: String,
                trim: true
            }
        },
        updates: [{
            date: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                trim: true
            },
            description: {
                type: String,
                trim: true
            },
            updatedBy: {
                type: String,
                enum: ['Referrer', 'Student', 'System']
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

// Pre-save hook to generate referral code
referralSchema.pre('save', async function(next) {
    if(this.isNew && !this.referralCode) {
        this.referralCode = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

// Compound indexes for efficient queries
referralSchema.index({ referrer: 1, referralDate: -1 });
referralSchema.index({ student: 1, referralDate: -1 });
referralSchema.index({ status: 1, referralDate: -1 });

export const Referral = mongoose.model("Referral", referralSchema);
