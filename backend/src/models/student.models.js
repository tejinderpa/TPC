import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const studentSchema = new Schema(
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
            enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'OTHER'],
            index: true
        },
        batch: {
            type: Number,
            required: true,
            index: true
        },
        currentSemester: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },
        cgpa: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        },
        isPlaced: {
            type: Boolean,
            default: false,
            index: true
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        profile: {
            type: Schema.Types.ObjectId,
            ref: "StudentProfile"
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

studentSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

studentSchema.methods.isPasswordCorrect = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.generateAccessToken = function() {
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

studentSchema.methods.generateRefreshToken = function() {
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

export const Student = mongoose.model("Student", studentSchema);
