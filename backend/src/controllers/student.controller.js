import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Student} from "../models/student.models.js";
import {StudentProfile} from "../models/studentProfile.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(studentId) => {
    try{
        const student = await Student.findById(studentId);
        const accessToken = student.generateAccessToken();
        const refreshToken = student.generateRefreshToken();

        student.refreshToken = refreshToken;
        await student.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong in generating access and refresh tokens");
    }
};

const registerStudent = asyncHandler(async (req, res) => {
    const {enrollmentNumber, email, password, fullName, phone, branch, batch, currentSemester, cgpa} = req.body;

    if([enrollmentNumber, email, password, fullName, phone, branch, batch, currentSemester, cgpa].some((field) => 
        field === undefined || field === null || String(field).trim() === ""
    )){
        throw new ApiError(400, "All fields are required");
    }

    const existedStudent = await Student.findOne({
        $or: [{enrollmentNumber}, {email}]
    });

    if(existedStudent){
        throw new ApiError(409, "Student with email or enrollment number already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(400, "Avatar upload failed");
    }

    const student = await Student.create({
        enrollmentNumber: enrollmentNumber.toUpperCase(),
        email,
        password,
        fullName,
        phone,
        branch,
        batch,
        currentSemester,
        cgpa,
        avatar: avatar.url
    });

    const createdStudent = await Student.findById(student._id).select("-password -refreshToken");
    if(!createdStudent){
        throw new ApiError(500, "Student registration failed");
    }

    return res.status(201).json(
        new ApiResponse(201, createdStudent, "Student registered successfully")
    );
});

const loginStudent = asyncHandler(async (req, res) => {
    const {email, enrollmentNumber, password} = req.body;

    if(!enrollmentNumber && !email){
        throw new ApiError(400, "Enrollment number or email is required");
    }

    const student = await Student.findOne({
        $or: [{enrollmentNumber}, {email}]
    });

    if(!student){
        throw new ApiError(404, "Student does not exist");
    }

    if(!student.isActive){
        throw new ApiError(403, "Student account is deactivated");
    }

    const isPasswordValid = await student.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(student._id);

    const loggedInStudent = await Student.findById(student._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                student: loggedInStudent,
                accessToken,
                refreshToken
            }, "Student logged in successfully")
        );
});

const logoutStudent = asyncHandler(async(req, res) => {
    await Student.findByIdAndUpdate(
        req.student._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Student logged out successfully"));
});

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        const student = await Student.findById(decodedToken?.id);
        if(!student){
            throw new ApiError(401, "Invalid refresh token");
        }

        if(incomingRefreshToken !== student?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(student._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, {
                    accessToken,
                    refreshToken: newRefreshToken
                }, "Access token refreshed successfully")
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const getCurrentStudent = asyncHandler(async(req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.student, "Current student fetched successfully"));
});

const updateStudentDetails = asyncHandler(async(req, res) => {
    const {fullName, phone, currentSemester, cgpa} = req.body;

    if(!fullName && !phone && !currentSemester && !cgpa){
        throw new ApiError(400, "At least one field is required to update");
    }

    const updateFields = {};
    if(fullName) updateFields.fullName = fullName;
    if(phone) updateFields.phone = phone;
    if(currentSemester) updateFields.currentSemester = currentSemester;
    if(cgpa) updateFields.cgpa = cgpa;

    const student = await Student.findByIdAndUpdate(
        req.student?._id,
        {$set: updateFields},
        {new: true}
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, student, "Student details updated successfully"));
});

const updateStudentAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path;
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar");
    }

    const student = await Student.findByIdAndUpdate(
        req.student?._id,
        {$set: {avatar: avatar.url}},
        {new: true}
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, student, "Avatar updated successfully"));
});

const changePassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body;

    if(!oldPassword || !newPassword || !confirmPassword){
        throw new ApiError(400, "All fields are required");
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "New password and confirm password do not match");
    }

    const student = await Student.findById(req.student?._id);
    const isPasswordCorrect = await student.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid old password");
    }

    student.password = newPassword;
    await student.save({validateBeforeSave: false});

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getStudentById = asyncHandler(async(req, res) => {
    const {studentId} = req.params;

    if(!studentId){
        throw new ApiError(400, "Student ID is required");
    }

    const student = await Student.findById(studentId)
        .select("-password -refreshToken")
        .populate("profile");

    if(!student){
        throw new ApiError(404, "Student not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, student, "Student fetched successfully"));
});

const getAllStudents = asyncHandler(async(req, res) => {
    const {page = 1, limit = 10, branch, batch, isPlaced, search} = req.query;

    const query = {isActive: true};

    if(branch) query.branch = branch;
    if(batch) query.batch = batch;
    if(isPlaced !== undefined) query.isPlaced = isPlaced === 'true';
    if(search){
        query.$or = [
            {fullName: {$regex: search, $options: 'i'}},
            {enrollmentNumber: {$regex: search, $options: 'i'}},
            {email: {$regex: search, $options: 'i'}}
        ];
    }

    const students = await Student.find(query)
        .select("-password -refreshToken")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({createdAt: -1});

    const count = await Student.countDocuments(query);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            students,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalStudents: count
        }, "Students fetched successfully"));
});

const markStudentAsPlaced = asyncHandler(async(req, res) => {
    const {studentId} = req.params;

    if(!studentId){
        throw new ApiError(400, "Student ID is required");
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        {$set: {isPlaced: true}},
        {new: true}
    ).select("-password -refreshToken");

    if(!student){
        throw new ApiError(404, "Student not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, student, "Student marked as placed successfully"));
});

const deleteStudent = asyncHandler(async(req, res) => {
    const {studentId} = req.params;

    if(!studentId){
        throw new ApiError(400, "Student ID is required");
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        {$set: {isActive: false}},
        {new: true}
    ).select("-password -refreshToken");

    if(!student){
        throw new ApiError(404, "Student not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, student, "Student deactivated successfully"));
});

export {
    registerStudent,
    loginStudent,
    logoutStudent,
    refreshAccessToken,
    getCurrentStudent,
    updateStudentDetails,
    updateStudentAvatar,
    changePassword,
    getStudentById,
    getAllStudents,
    markStudentAsPlaced,
    deleteStudent
};
