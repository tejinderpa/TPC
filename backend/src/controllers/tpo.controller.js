import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {TPO} from "../models/tpo.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(tpoId) => {
    try{
        const tpo = await TPO.findById(tpoId);
        const accessToken = tpo.generateAccessToken();
        const refreshToken = tpo.generateRefreshToken();

        tpo.refreshToken = refreshToken;
        await tpo.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong in generating access and refresh tokens");
    }
};

const registerTPO = asyncHandler(async (req, res) => {
    const {employeeId, email, password, fullName, phone, designation, role, department, permissions, assignedBranches, assignedBatches} = req.body;

    if(!employeeId || !email || !password || !fullName || !phone || !designation || !role){
        throw new ApiError(400, "All required fields must be provided");
    }

    const existedTPO = await TPO.findOne({
        $or: [{employeeId}, {email}]
    });

    if(existedTPO){
        throw new ApiError(409, "TPO with this employee ID or email already exists");
    }

    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(400, "Avatar upload failed");
    }

    const tpo = await TPO.create({
        employeeId: employeeId.toUpperCase(),
        email,
        password,
        fullName,
        phone,
        designation,
        role,
        department: department || "",
        avatar: avatar.url,
        permissions: permissions || {},
        assignedBranches: assignedBranches || [],
        assignedBatches: assignedBatches || [],
        isActive: true
    });

    const createdTPO = await TPO.findById(tpo._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, createdTPO, "TPO registered successfully")
    );
});

const loginTPO = asyncHandler(async (req, res) => {
    const {email, employeeId, password} = req.body;

    if(!employeeId && !email){
        throw new ApiError(400, "Employee ID or email is required");
    }

    const tpo = await TPO.findOne({
        $or: [{employeeId}, {email}]
    });

    if(!tpo){
        throw new ApiError(404, "TPO does not exist");
    }

    if(!tpo.isActive){
        throw new ApiError(403, "TPO account is deactivated");
    }

    const isPasswordValid = await tpo.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(tpo._id);

    // Update last login
    tpo.lastLogin = Date.now();
    await tpo.save({validateBeforeSave: false});

    const loggedInTPO = await TPO.findById(tpo._id).select("-password -refreshToken");

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
                tpo: loggedInTPO,
                accessToken,
                refreshToken
            }, "TPO logged in successfully")
        );
});

const logoutTPO = asyncHandler(async(req, res) => {
    await TPO.findByIdAndUpdate(
        req.tpo._id,
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
        .json(new ApiResponse(200, {}, "TPO logged out successfully"));
});

const getCurrentTPO = asyncHandler(async(req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.tpo, "Current TPO fetched successfully"));
});

const updateTPODetails = asyncHandler(async(req, res) => {
    const {fullName, phone, designation, department} = req.body;

    const updateFields = {};
    if(fullName) updateFields.fullName = fullName;
    if(phone) updateFields.phone = phone;
    if(designation) updateFields.designation = designation;
    if(department) updateFields.department = department;

    const tpo = await TPO.findByIdAndUpdate(
        req.tpo?._id,
        {$set: updateFields},
        {new: true}
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, tpo, "TPO details updated successfully"));
});

const updateTPOAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path;
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar");
    }

    const tpo = await TPO.findByIdAndUpdate(
        req.tpo?._id,
        {$set: {avatar: avatar.url}},
        {new: true}
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, tpo, "Avatar updated successfully"));
});

const changePassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body;

    if(!oldPassword || !newPassword || !confirmPassword){
        throw new ApiError(400, "All fields are required");
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "New password and confirm password do not match");
    }

    const tpo = await TPO.findById(req.tpo?._id);
    const isPasswordCorrect = await tpo.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid old password");
    }

    tpo.password = newPassword;
    await tpo.save({validateBeforeSave: false});

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getTPOById = asyncHandler(async(req, res) => {
    const {tpoId} = req.params;

    if(!tpoId){
        throw new ApiError(400, "TPO ID is required");
    }

    const tpo = await TPO.findById(tpoId).select("-password -refreshToken");

    if(!tpo){
        throw new ApiError(404, "TPO not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tpo, "TPO fetched successfully"));
});

const getAllTPO = asyncHandler(async(req, res) => {
    const {page = 1, limit = 10, role, isActive} = req.query;

    const query = {};

    if(role) query.role = role;
    if(isActive !== undefined) query.isActive = isActive === 'true';

    const tpoList = await TPO.find(query)
        .select("-password -refreshToken")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({createdAt: -1});

    const count = await TPO.countDocuments(query);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            tpoList,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalTPO: count
        }, "TPO list fetched successfully"));
});

const updateTPOPermissions = asyncHandler(async(req, res) => {
    const {tpoId} = req.params;
    const {permissions} = req.body;

    if(!tpoId){
        throw new ApiError(400, "TPO ID is required");
    }

    if(!permissions){
        throw new ApiError(400, "Permissions object is required");
    }

    const tpo = await TPO.findByIdAndUpdate(
        tpoId,
        {$set: {permissions}},
        {new: true}
    ).select("-password -refreshToken");

    if(!tpo){
        throw new ApiError(404, "TPO not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tpo, "TPO permissions updated successfully"));
});

const updateTPORole = asyncHandler(async(req, res) => {
    const {tpoId} = req.params;
    const {role} = req.body;

    if(!tpoId){
        throw new ApiError(400, "TPO ID is required");
    }

    if(!role){
        throw new ApiError(400, "Role is required");
    }

    const validRoles = ['Admin', 'Coordinator', 'Faculty', 'Staff'];
    if(!validRoles.includes(role)){
        throw new ApiError(400, "Invalid role");
    }

    const tpo = await TPO.findByIdAndUpdate(
        tpoId,
        {$set: {role}},
        {new: true}
    ).select("-password -refreshToken");

    if(!tpo){
        throw new ApiError(404, "TPO not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tpo, "TPO role updated successfully"));
});

const assignBranchesAndBatches = asyncHandler(async(req, res) => {
    const {tpoId} = req.params;
    const {assignedBranches, assignedBatches} = req.body;

    if(!tpoId){
        throw new ApiError(400, "TPO ID is required");
    }

    const updateFields = {};
    if(assignedBranches) updateFields.assignedBranches = assignedBranches;
    if(assignedBatches) updateFields.assignedBatches = assignedBatches;

    const tpo = await TPO.findByIdAndUpdate(
        tpoId,
        {$set: updateFields},
        {new: true}
    ).select("-password -refreshToken");

    if(!tpo){
        throw new ApiError(404, "TPO not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tpo, "Branches and batches assigned successfully"));
});

const deactivateTPO = asyncHandler(async(req, res) => {
    const {tpoId} = req.params;

    if(!tpoId){
        throw new ApiError(400, "TPO ID is required");
    }

    const tpo = await TPO.findByIdAndUpdate(
        tpoId,
        {$set: {isActive: false}},
        {new: true}
    ).select("-password -refreshToken");

    if(!tpo){
        throw new ApiError(404, "TPO not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tpo, "TPO deactivated successfully"));
});

const deleteTPO = asyncHandler(async(req, res) => {
    const {tpoId} = req.params;

    if(!tpoId){
        throw new ApiError(400, "TPO ID is required");
    }

    const tpo = await TPO.findByIdAndDelete(tpoId);
    if(!tpo){
        throw new ApiError(404, "TPO not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "TPO deleted successfully"));
});

export {
    registerTPO,
    loginTPO,
    logoutTPO,
    getCurrentTPO,
    updateTPODetails,
    updateTPOAvatar,
    changePassword,
    getTPOById,
    getAllTPO,
    updateTPOPermissions,
    updateTPORole,
    assignBranchesAndBatches,
    deactivateTPO,
    deleteTPO
};
