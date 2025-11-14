import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
            // Connection options
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
        console.log(`Database Name: ${connectionInstance.connection.name}`);

        // Create indexes for better query performance
        await createIndexes(connectionInstance.connection);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
        });

    } catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1);
    }
};

// Create indexes for search-heavy and frequently queried fields
const createIndexes = async (db) => {
    try {
        console.log('Creating database indexes...');

        // Student indexes
        await db.collection('students').createIndex({ email: 1 }, { unique: true });
        await db.collection('students').createIndex({ enrollmentNumber: 1 }, { unique: true });
        await db.collection('students').createIndex({ branch: 1, batch: 1 });
        await db.collection('students').createIndex({ cgpa: -1 });
        await db.collection('students').createIndex({ isPlaced: 1 });
        await db.collection('students').createIndex({ skills: 1 });
        await db.collection('students').createIndex({ isActive: 1 });
        await db.collection('students').createIndex({ 
            fullName: 'text', 
            email: 'text', 
            enrollmentNumber: 'text' 
        }, { 
            name: 'student_text_search' 
        });

        // Company indexes
        await db.collection('companies').createIndex({ email: 1 }, { unique: true });
        await db.collection('companies').createIndex({ companyName: 1 });
        await db.collection('companies').createIndex({ isVerified: 1 });
        await db.collection('companies').createIndex({ industry: 1 });
        await db.collection('companies').createIndex({ 
            companyName: 'text', 
            description: 'text' 
        }, { 
            name: 'company_text_search' 
        });

        // Job indexes
        await db.collection('jobs').createIndex({ company: 1 });
        await db.collection('jobs').createIndex({ status: 1 });
        await db.collection('jobs').createIndex({ jobType: 1 });
        await db.collection('jobs').createIndex({ eligibleBranches: 1 });
        await db.collection('jobs').createIndex({ applicationDeadline: 1 });
        await db.collection('jobs').createIndex({ minCGPA: -1 });
        await db.collection('jobs').createIndex({ salaryPackage: -1 });
        await db.collection('jobs').createIndex({ 
            jobTitle: 'text', 
            jobDescription: 'text',
            requiredSkills: 'text' 
        }, { 
            name: 'job_text_search' 
        });

        // Application indexes
        await db.collection('applications').createIndex({ student: 1 });
        await db.collection('applications').createIndex({ job: 1 });
        await db.collection('applications').createIndex({ status: 1 });
        await db.collection('applications').createIndex({ appliedDate: -1 });
        await db.collection('applications').createIndex({ student: 1, job: 1 }, { unique: true });

        // Drive indexes
        await db.collection('drives').createIndex({ company: 1 });
        await db.collection('drives').createIndex({ status: 1 });
        await db.collection('drives').createIndex({ driveDate: 1 });
        await db.collection('drives').createIndex({ eligibleBranches: 1 });

        // Alumni indexes
        await db.collection('alumnis').createIndex({ email: 1 }, { unique: true });
        await db.collection('alumnis').createIndex({ graduationYear: 1 });
        await db.collection('alumnis').createIndex({ isAvailableForMentorship: 1 });
        await db.collection('alumnis').createIndex({ currentCompany: 1 });

        // TPO indexes
        await db.collection('tpos').createIndex({ email: 1 }, { unique: true });
        await db.collection('tpos').createIndex({ role: 1 });
        await db.collection('tpos').createIndex({ assignedBranches: 1 });

        // Event Participation indexes
        await db.collection('eventparticipations').createIndex({ student: 1 });
        await db.collection('eventparticipations').createIndex({ eventName: 1, eventDate: 1 });
        await db.collection('eventparticipations').createIndex({ attendanceStatus: 1 });

        // Reward indexes
        await db.collection('rewards').createIndex({ student: 1 });
        await db.collection('rewards').createIndex({ rewardType: 1 });
        await db.collection('rewards').createIndex({ awardedDate: -1 });

        // Mentorship indexes
        await db.collection('mentorships').createIndex({ student: 1 });
        await db.collection('mentorships').createIndex({ alumni: 1 });
        await db.collection('mentorships').createIndex({ status: 1 });

        // Referral indexes
        await db.collection('referrals').createIndex({ referredBy: 1 });
        await db.collection('referrals').createIndex({ student: 1 });
        await db.collection('referrals').createIndex({ status: 1 });

        // Analytics indexes
        await db.collection('analytics').createIndex({ analyticsType: 1 });
        await db.collection('analytics').createIndex({ startDate: 1, endDate: 1 });
        await db.collection('analytics').createIndex({ createdAt: -1 });

        console.log('Database indexes created successfully ✓');
    } catch (error) {
        console.error('Error creating indexes:', error);
        // Don't exit on index creation errors as they may already exist
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during database disconnection:', err);
        process.exit(1);
    }
});

export default connectDB;