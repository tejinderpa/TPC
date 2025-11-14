import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { Student } from "../models/student.models.js"
import { Company } from "../models/company.models.js"
import { Alumni } from "../models/alumni.models.js"
import { TPO } from "../models/tpo.models.js"

export const verifyJWT = asyncHandler(async(req, _, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized Request, No token provided")
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        // Try to find user in all collections based on token
        let user = null;
        
        // Check Student
        user = await Student.findById(decodedToken?._id).select("-password -refreshToken");
        if(user) {
            req.user = user;
            req.student = user;
            return next();
        }
        
        // Check Company
        user = await Company.findById(decodedToken?._id).select("-password -refreshToken");
        if(user) {
            req.user = user;
            req.company = user;
            return next();
        }
        
        // Check Alumni
        user = await Alumni.findById(decodedToken?._id).select("-password -refreshToken");
        if(user) {
            req.user = user;
            req.alumni = user;
            return next();
        }
        
        // Check TPO
        user = await TPO.findById(decodedToken?._id).select("-password -refreshToken");
        if(user) {
            req.user = user;
            req.tpo = user;
            return next();
        }
        
        // If no user found in any collection
        throw new ApiError(401, "Invalid Access Token")
        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})