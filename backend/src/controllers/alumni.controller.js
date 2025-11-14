import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Alumni} from "../models/alumni.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(alumniId) => {
    try{
        const alumni = await Alumni.findById(alumniId);
        const accessToken = alumni.generateAccessToken();
        const refreshToken = alumni.generateRefreshToken();

        alumni.refreshToken = refreshToken;
        await alumni.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong in generating access and refresh tokens");
    }
};

const registerAlumni = asyncHandler(async (req, res) => {
    const {enrollmentNumber, email, password, fullName, phone, branch, graduationYear, currentCompany, currentDesignation, bio} = req.body;

    if(!enrollmentNumber || !email || !password || !fullName || !phone || !branch || !graduationYear){
        throw new ApiError(400, "All required fields must be provided");
    }

    const existedAlumni = await Alumni.findOne({
        $or: [{enrollmentNumber}, {email}]
    });

    if(existedAlumni){
        throw new ApiError(409, "Alumni with email or enrollment number already exists");
    }

    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(400, "Avatar upload failed");
    }

    const alumni = await Alumni.create({
        enrollmentNumber: enrollmentNumber.toUpperCase(),
        email,
        password,
        fullName,
        phone,
        branch,
        graduationYear,
        currentCompany: currentCompany || "",
        currentDesignation: currentDesignation || "",
        bio: bio || "",
        avatar: avatar.url,
        isVerified: false,
        isActive: true
    });

    const createdAlumni = await Alumni.findById(alumni._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, createdAlumni, "Alumni registered successfully. Awaiting verification.")
    );
});

const loginAlumni = asyncHandler(async (req, res) => {
    const {email, enrollmentNumber, password} = req.body;

    if(!enrollmentNumber && !email){
        throw new ApiError(400, "Enrollment number or email is required");
    }

    const alumni = await Alumni.findOne({
        $or: [{enrollmentNumber}, {email}]
    });

    if(!alumni){
        throw new ApiError(404, "Alumni does not exist");
    }

    if(!alumni.isActive){
        throw new ApiError(403, "Alumni account is deactivated");
    }

    const isPasswordValid = await alumni.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(alumni._id);

    const loggedInAlumni = await Alumni.findById(alumni._id).select("-password -refreshToken");

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
                alumni: loggedInAlumni,
                accessToken,
                refreshToken
            }, "Alumni logged in successfully")
        );
});

const logoutAlumni = asyncHandler(async(req, res) => {
    await Alumni.findByIdAndUpdate(
        req.alumni._id,
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
        .json(new ApiResponse(200, {}, "Alumni logged out successfully"));
});

const getCurrentAlumni = asyncHandler(async(req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.alumni, "Current alumni fetched successfully"));
});

const updateAlumniProfile = asyncHandler(async(req, res) => {
    const {fullName, phone, currentCompany, currentDesignation, yearsOfExperience, industry, location, bio, expertise, socialLinks, isAvailableForMentorship} = req.body;

    const updateFields = {};
    if(fullName) updateFields.fullName = fullName;
    if(phone) updateFields.phone = phone;
    if(currentCompany) updateFields.currentCompany = currentCompany;
    if(currentDesignation) updateFields.currentDesignation = currentDesignation;
    if(yearsOfExperience !== undefined) updateFields.yearsOfExperience = yearsOfExperience;
    if(industry) updateFields.industry = industry;
    if(location) updateFields.location = location;
    if(bio) updateFields.bio = bio;
    if(expertise) updateFields.expertise = expertise;
    if(socialLinks) updateFields.socialLinks = socialLinks;
    if(isAvailableForMentorship !== undefined) updateFields.isAvailableForMentorship = isAvailableForMentorship;

    const alumni = await Alumni.findByIdAndUpdate(
        req.alumni?._id,
        {$set: updateFields},
        {new: true}
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, alumni, "Alumni profile updated successfully"));
});

const updateAlumniAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path;
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar");
    }

    const alumni = await Alumni.findByIdAndUpdate(
        req.alumni?._id,
        {$set: {avatar: avatar.url}},
        {new: true}
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, alumni, "Avatar updated successfully"));
});

const getAlumniById = asyncHandler(async(req, res) => {
    const {alumniId} = req.params;

    if(!alumniId){
        throw new ApiError(400, "Alumni ID is required");
    }

    const alumni = await Alumni.findById(alumniId).select("-password -refreshToken");

    if(!alumni){
        throw new ApiError(404, "Alumni not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, alumni, "Alumni fetched successfully"));
});

const getAllAlumni = asyncHandler(async(req, res) => {
    const {page = 1, limit = 10, branch, graduationYear, industry, isAvailableForMentorship, search} = req.query;

    const query = {isActive: true, isVerified: true};

    if(branch) query.branch = branch;
    if(graduationYear) query.graduationYear = parseInt(graduationYear);
    if(industry) query.industry = {$regex: industry, $options: 'i'};
    if(isAvailableForMentorship !== undefined) query.isAvailableForMentorship = isAvailableForMentorship === 'true';
    if(search){
        query.$or = [
            {fullName: {$regex: search, $options: 'i'}},
            {enrollmentNumber: {$regex: search, $options: 'i'}},
            {currentCompany: {$regex: search, $options: 'i'}}
        ];
    }

    const alumni = await Alumni.find(query)
        .select("-password -refreshToken")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({graduationYear: -1});

    const count = await Alumni.countDocuments(query);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            alumni,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalAlumni: count
        }, "Alumni fetched successfully"));
});

const getMentors = asyncHandler(async(req, res) => {
    const {page = 1, limit = 10, expertise, industry} = req.query;

    const query = {
        isActive: true,
        isVerified: true,
        isAvailableForMentorship: true
    };

    if(expertise) query.expertise = {$in: [expertise]};
    if(industry) query.industry = {$regex: industry, $options: 'i'};

    const mentors = await Alumni.find(query)
        .select("fullName email avatar currentCompany currentDesignation yearsOfExperience industry expertise bio socialLinks")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({yearsOfExperience: -1});

    const count = await Alumni.countDocuments(query);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            mentors,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalMentors: count
        }, "Mentors fetched successfully"));
});

const verifyAlumni = asyncHandler(async(req, res) => {
    const {alumniId} = req.params;

    if(!alumniId){
        throw new ApiError(400, "Alumni ID is required");
    }

    const alumni = await Alumni.findByIdAndUpdate(
        alumniId,
        {$set: {isVerified: true}},
        {new: true}
    ).select("-password -refreshToken");

    if(!alumni){
        throw new ApiError(404, "Alumni not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, alumni, "Alumni verified successfully"));
});

const deactivateAlumni = asyncHandler(async(req, res) => {
    const {alumniId} = req.params;

    if(!alumniId){
        throw new ApiError(400, "Alumni ID is required");
    }

    const alumni = await Alumni.findByIdAndUpdate(
        alumniId,
        {$set: {isActive: false}},
        {new: true}
    ).select("-password -refreshToken");

    if(!alumni){
        throw new ApiError(404, "Alumni not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, alumni, "Alumni deactivated successfully"));
});

export {
    registerAlumni,
    loginAlumni,
    logoutAlumni,
    getCurrentAlumni,
    updateAlumniProfile,
    updateAlumniAvatar,
    getAlumniById,
    getAllAlumni,
    getMentors,
    verifyAlumni,
    deactivateAlumni
};
