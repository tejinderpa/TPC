import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong in generating access and refresh tokens");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation
    // check if user already exists: username , email
    // check for images, check for avatar, check for coverImage
    // upload them to cloudinary, check avatar
    // create user object - create entry in db
    // remove password and refresh token feed from response
    // check for user creation
    // return response

    const {fullname, email, username, password} = req.body
    console.log("email: ", email);

    // if(fullname === ""){
    //     throw new ApiError(400, "Full name is required")
    // }
    if([fullname, email, username, password].some((field)=>field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or : [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(400, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }
    
    console.log("Uploading avatar to Cloudinary...");
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log("Avatar upload result:", avatar);
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("Cover image upload result:", coverImage);

    if(!avatar){
        throw new ApiError(400, "Avatar upload failed")
    }

    const user = await User.create({
        fullname,
        email,
        username:username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "User creation failed")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )

})


const loginUser = asyncHandler(async (req, res) => {
    //req body -> data
    // username or email
    //find the user
    // password check
    // access and refresh token generation
    // send cookies secure

    const {email, username, password} = req.body
    if(!username && ! email){
        throw new ApiError(400, "Username or email is required")
    }
    const user = await User.findOne({
        $or : [{ username }, { email }]   // $(mongodb operators)
    })

    if(!user){
        throw new ApiError(404, "User don't exist")
    }

    const isPassValid = await user.isPasswordCorrect(password, user.password)

    if(!isPassValid){
        throw new ApiError(401, "Password Incorrect")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, 
                {
                    user : loggedInUser, 
                    accessToken,
                    refreshToken
                } ,
                "User logged in successfully"
            )
        )
})


const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
    req.user._id,
    {
        $set : {
            refreshToken: undefined
        }
    },
    {
        new : true
    }
   )
   const options = {
       httpOnly : true,
       secure : true
   }

   return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
       new ApiResponse(200, "User logged out successfully")
   )

})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request, No refresh token provided")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?.id)
        if(!user)
            throw new ApiError(401, "Unauthorized Request, Invalid refresh token")
    
    
        if(!incomingRefreshToken || incomingRefreshToken !== user?.refreshToken)
            throw new ApiError(401, "Unauthorized Request, Invalid refresh token")
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    accessToken,
                    refreshToken : newRefreshToken
                } ,
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized Request, Invalid refresh token")
    }
})


const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body
    if(newPassword !== confirmPassword){
        throw new ApiError(400, "New password and confirm password do not match")
    } 
    
    const user = User.findById(req.user?._id)
    const isPassCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPassCorrect){
        throw new ApiError(401, "Password is incorrect")
    }
    user.password = newPassword
    await user.save({validateBeforeSave : false})
    return res
    .status(200)
    .json(
        new ApiResponse(200, "Password changed successfully")
    )
})


const getCurrentUser = asyncHandler(async(req, res) =>{
    return res.status(200)
    .json(200, req.user, "current User fetched successfully.")
})


const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname, email, username, password, avatar, coverImage} = req.body

    if(!fullname || !email || !username){
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullname,
                email,
                username,
                password,
                avatar,
                coverImage
            }
        },
        {new : true}
    ).select("-password -refreshToken")
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Account details updated successfully")
    )   
})


const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400, "Avatar upload failed")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {     // for updating we use set operator
                avatar: avatar.url
            }
        },
        {new : true}
    ).select("-password -refreshToken")


    return res
    .status(200)
    .json(
        new ApiResponse(200, avatar, "Avatar updated successfully")
    )
})
// for coverImage
const updateCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400, "Cover image upload failed")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage: coverImage.url
            }
        },
        {new : true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200, coverImage, "Cover image updated successfully")
    ) 
})

export {
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage
};
