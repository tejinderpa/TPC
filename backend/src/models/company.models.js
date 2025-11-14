import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const companySchema = new Schema(
    {
        companyName: {
            type: String,
            required: true,
            unique: true,
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
        logo: {
            type: String, // cloudinary url
            required: true
        },
        website: {
            type: String,
            trim: true
        },
        industry: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        companySize: {
            type: String,
            enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
            required: true
        },
        headquarters: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            maxlength: 2000
        },
        foundedYear: {
            type: Number,
            min: 1800,
            max: new Date().getFullYear()
        },
        contactPerson: {
            name: {
                type: String,
                required: true,
                trim: true
            },
            designation: {
                type: String,
                trim: true
            },
            email: {
                type: String,
                required: true,
                lowercase: true,
                trim: true
            },
            phone: {
                type: String,
                required: true,
                trim: true
            }
        },
        socialLinks: {
            linkedin: {
                type: String,
                trim: true
            },
            twitter: {
                type: String,
                trim: true
            },
            facebook: {
                type: String,
                trim: true
            }
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

companySchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

companySchema.methods.isPasswordCorrect = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

companySchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            companyName: this.companyName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

companySchema.methods.generateRefreshToken = function() {
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

export const Company = mongoose.model("Company", companySchema);
