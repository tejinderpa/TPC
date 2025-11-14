import mongoose, {Schema} from "mongoose";

const studentProfileSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            unique: true,
            index: true
        },
        resume: {
            type: String, // cloudinary url
            required: true
        },
        bio: {
            type: String,
            trim: true,
            maxlength: 500
        },
        skills: [{
            type: String,
            trim: true
        }],
        projects: [{
            title: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                trim: true
            },
            technologies: [{
                type: String,
                trim: true
            }],
            link: {
                type: String,
                trim: true
            },
            startDate: {
                type: Date
            },
            endDate: {
                type: Date
            }
        }],
        certifications: [{
            title: {
                type: String,
                required: true,
                trim: true
            },
            issuedBy: {
                type: String,
                trim: true
            },
            issuedDate: {
                type: Date
            },
            credentialUrl: {
                type: String,
                trim: true
            }
        }],
        internships: [{
            company: {
                type: String,
                required: true,
                trim: true
            },
            role: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                trim: true
            },
            startDate: {
                type: Date,
                required: true
            },
            endDate: {
                type: Date
            },
            isCurrentlyWorking: {
                type: Boolean,
                default: false
            }
        }],
        achievements: [{
            title: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                trim: true
            },
            date: {
                type: Date
            }
        }],
        socialLinks: {
            linkedin: {
                type: String,
                trim: true
            },
            github: {
                type: String,
                trim: true
            },
            portfolio: {
                type: String,
                trim: true
            },
            twitter: {
                type: String,
                trim: true
            }
        },
        tenthPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        twelfthPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        activeBacklogs: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

export const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
