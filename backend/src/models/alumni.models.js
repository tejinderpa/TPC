import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const alumniSchema = new Schema(
    {
        enrollmentNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        branch: {
            type: String,
            required: true,
            enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'OTHER']
        },
        graduationYear: {
            type: Number,
            required: true,
            index: true
        },
        currentCompany: {
            type: String,
            trim: true,
            index: true
        },
        currentDesignation: {
            type: String,
            trim: true
        },
        yearsOfExperience: {
            type: Number,
            default: 0,
            min: 0
        },
        industry: {
            type: String,
            trim: true,
            index: true
        },
        location: {
            city: {
                type: String,
                trim: true
            },
            country: {
                type: String,
                trim: true
            }
        },
        bio: {
            type: String,
            trim: true,
            maxlength: 500
        },
        expertise: [{
            type: String,
            trim: true
        }],
        achievements: [{
            title: {
                type: String,
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
            twitter: {
                type: String,
                trim: true
            },
            portfolio: {
                type: String,
                trim: true
            }
        },
        isAvailableForMentorship: {
            type: Boolean,
            default: false,
            index: true
        },
        isVerified: {
            type: Boolean,
            default: false,
            index: true
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

alumniSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

alumniSchema.methods.isPasswordCorrect = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

alumniSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            enrollmentNumber: this.enrollmentNumber,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

alumniSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const Alumni = mongoose.model("Alumni", alumniSchema);
