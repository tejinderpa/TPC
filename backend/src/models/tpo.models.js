import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const tpoSchema = new Schema(
    {
        employeeId: {
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
        designation: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            required: true,
            enum: ['Admin', 'Coordinator', 'Faculty', 'Staff'],
            default: 'Coordinator',
            index: true
        },
        department: {
            type: String,
            trim: true
        },
        permissions: {
            canCreateJobs: {
                type: Boolean,
                default: true
            },
            canEditJobs: {
                type: Boolean,
                default: true
            },
            canDeleteJobs: {
                type: Boolean,
                default: false
            },
            canManageDrives: {
                type: Boolean,
                default: true
            },
            canManageStudents: {
                type: Boolean,
                default: true
            },
            canManageCompanies: {
                type: Boolean,
                default: true
            },
            canViewAnalytics: {
                type: Boolean,
                default: true
            },
            canManageTPO: {
                type: Boolean,
                default: false
            },
            canApproveApplications: {
                type: Boolean,
                default: true
            }
        },
        assignedBranches: [{
            type: String,
            enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'ALL']
        }],
        assignedBatches: [{
            type: Number
        }],
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        lastLogin: {
            type: Date
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

tpoSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

tpoSchema.methods.isPasswordCorrect = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

tpoSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            employeeId: this.employeeId,
            fullName: this.fullName,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

tpoSchema.methods.generateRefreshToken = function() {
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

export const TPO = mongoose.model("TPO", tpoSchema);
