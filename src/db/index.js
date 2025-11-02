import mongoose from "mongoose";
import { DB_NAME } from "D:\Web Dev 2025\Code Aur Chai\Day 3\src\constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/{DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`)
    }catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1);
    }
}

export default connectDB