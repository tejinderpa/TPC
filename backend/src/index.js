// require('dotenv').config()
import dotenv from "dotenv"

// IMPORTANT: Load environment variables FIRST before any other imports
dotenv.config({
    path : './.env'
})

// Verify environment variables are loaded
console.log("Environment variables loaded:", {
    PORT: process.env.PORT,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '***set***' : 'NOT SET',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '***set***' : 'NOT SET'
});

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js"
import app from "./app.js"

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`Server is running at PORT : ${process.env.PORT}`);
        
    })
})
.catch((err) => {
    console.log("MONGO DB connection failed...", err);
    
})




/*
import express from "express"
const app = express()

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", () => {
            console.log("APP is not working, database is okay")
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR: ", error)
        throw error
    }
})
    */ 