import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Company} from "../models/company.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(companyId) => {
    try{
        const company = await Company.findById(companyId);
        const accessToken = company.generateAccessToken();
        const refreshToken = company.generateRefreshToken();

        company.refreshToken = refreshToken;
        await company.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong in generating access and refresh tokens");
    }
};

const registerCompany = asyncHandler(async (req, res) => {
    const {companyName, email, password, website, industry, companySize, headquarters, description, foundedYear, contactPerson} = req.body;

    if(!companyName || !email || !password || !industry || !companySize || !headquarters || !contactPerson){
        throw new ApiError(400, "All required fields must be provided");
    }

    if(!contactPerson.name || !contactPerson.email || !contactPerson.phone){
        throw new ApiError(400, "Contact person details are incomplete");
    }

    const existedCompany = await Company.findOne({
        $or: [{companyName}, {email}]
    });

    if(existedCompany){
        throw new ApiError(409, "Company with this name or email already exists");
    }

    const logoLocalPath = req.file?.path;
    if(!logoLocalPath){
        throw new ApiError(400, "Company logo is required");
    }

    const logo = await uploadOnCloudinary(logoLocalPath);
    if(!logo){
        throw new ApiError(400, "Logo upload failed");
    }

    const company = await Company.create({
        companyName,
        email,
        password,
        logo: logo.url,
        website: website || "",
        industry,
        companySize,
        headquarters,
        description: description || "",
        foundedYear: foundedYear || null,
        contactPerson,
        isVerified: false,
        isActive: true
    });

    const createdCompany = await Company.findById(company._id).select("-password -refreshToken");
    if(!createdCompany){
        throw new ApiError(500, "Company registration failed");
    }

    return res.status(201).json(
        new ApiResponse(201, createdCompany, "Company registered successfully. Awaiting verification.")
    );
});

const loginCompany = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        throw new ApiError(400, "Email and password are required");
    }

    const company = await Company.findOne({email});

    if(!company){
        throw new ApiError(404, "Company does not exist");
    }

    if(!company.isActive){
        throw new ApiError(403, "Company account is deactivated");
    }

    const isPasswordValid = await company.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(company._id);

    const loggedInCompany = await Company.findById(company._id).select("-password -refreshToken");

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
                company: loggedInCompany,
                accessToken,
                refreshToken
            }, "Company logged in successfully")
        );
});

const logoutCompany = asyncHandler(async(req, res) => {
    await Company.findByIdAndUpdate(
        req.company._id,
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
        .json(new ApiResponse(200, {}, "Company logged out successfully"));
});

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        const company = await Company.findById(decodedToken?.id);
        if(!company){
            throw new ApiError(401, "Invalid refresh token");
        }

        if(incomingRefreshToken !== company?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(company._id);

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

const getCurrentCompany = asyncHandler(async(req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.company, "Current company fetched successfully"));
});

const updateCompanyDetails = asyncHandler(async(req, res) => {
    const {companyName, website, description, contactPerson, socialLinks} = req.body;

    const updateFields = {};
    if(companyName) updateFields.companyName = companyName;
    if(website) updateFields.website = website;
    if(description) updateFields.description = description;
    if(contactPerson) updateFields.contactPerson = contactPerson;
    if(socialLinks) updateFields.socialLinks = socialLinks;

    const company = await Company.findByIdAndUpdate(
        req.company?._id,
        {$set: updateFields},
        {new: true}
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company details updated successfully"));
});

const updateCompanyLogo = asyncHandler(async(req, res) => {
    const logoLocalPath = req.file?.path;
    
    if(!logoLocalPath){
        throw new ApiError(400, "Logo file is required");
    }

    const logo = await uploadOnCloudinary(logoLocalPath);
    if(!logo.url){
        throw new ApiError(400, "Error while uploading logo");
    }

    const company = await Company.findByIdAndUpdate(
        req.company?._id,
        {$set: {logo: logo.url}},
        {new: true}
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Logo updated successfully"));
});

const changePassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body;

    if(!oldPassword || !newPassword || !confirmPassword){
        throw new ApiError(400, "All fields are required");
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "New password and confirm password do not match");
    }

    const company = await Company.findById(req.company?._id);
    const isPasswordCorrect = await company.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid old password");
    }

    company.password = newPassword;
    await company.save({validateBeforeSave: false});

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCompanyById = asyncHandler(async(req, res) => {
    const {companyId} = req.params;

    if(!companyId){
        throw new ApiError(400, "Company ID is required");
    }

    const company = await Company.findById(companyId).select("-password -refreshToken");

    if(!company){
        throw new ApiError(404, "Company not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company fetched successfully"));
});

const getAllCompanies = asyncHandler(async(req, res) => {
    const {page = 1, limit = 10, industry, isVerified, search} = req.query;

    const query = {isActive: true};

    if(industry) query.industry = industry;
    if(isVerified !== undefined) query.isVerified = isVerified === 'true';
    if(search){
        query.$or = [
            {companyName: {$regex: search, $options: 'i'}},
            {industry: {$regex: search, $options: 'i'}},
            {headquarters: {$regex: search, $options: 'i'}}
        ];
    }

    const companies = await Company.find(query)
        .select("-password -refreshToken")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({createdAt: -1});

    const count = await Company.countDocuments(query);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            companies,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalCompanies: count
        }, "Companies fetched successfully"));
});

const verifyCompany = asyncHandler(async(req, res) => {
    const {companyId} = req.params;

    if(!companyId){
        throw new ApiError(400, "Company ID is required");
    }

    const company = await Company.findByIdAndUpdate(
        companyId,
        {$set: {isVerified: true}},
        {new: true}
    ).select("-password -refreshToken");

    if(!company){
        throw new ApiError(404, "Company not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company verified successfully"));
});

const deactivateCompany = asyncHandler(async(req, res) => {
    const {companyId} = req.params;

    if(!companyId){
        throw new ApiError(400, "Company ID is required");
    }

    const company = await Company.findByIdAndUpdate(
        companyId,
        {$set: {isActive: false}},
        {new: true}
    ).select("-password -refreshToken");

    if(!company){
        throw new ApiError(404, "Company not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company deactivated successfully"));
});

export {
    registerCompany,
    loginCompany,
    logoutCompany,
    refreshAccessToken,
    getCurrentCompany,
    updateCompanyDetails,
    updateCompanyLogo,
    changePassword,
    getCompanyById,
    getAllCompanies,
    verifyCompany,
    deactivateCompany
};
