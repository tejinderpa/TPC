import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

// General API rate limiter - applies to all requests
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        throw new ApiError(429, 'Too many requests from this IP, please try again after 15 minutes');
    }
});

// Strict rate limiter for authentication routes (login, register)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count successful requests
    handler: (req, res) => {
        throw new ApiError(429, 'Too many authentication attempts, please try again after 15 minutes');
    }
});

// Rate limiter for registration endpoints
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registration attempts per hour
    message: 'Too many accounts created from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many accounts created from this IP, please try again after an hour');
    }
});

// Rate limiter for login endpoints
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per 15 minutes
    message: 'Too many login attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    handler: (req, res) => {
        throw new ApiError(429, 'Too many login attempts, please try again after 15 minutes');
    }
});

// Rate limiter for password reset/change endpoints
export const passwordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 password change attempts per hour
    message: 'Too many password change attempts, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many password change attempts, please try again after an hour');
    }
});

// Rate limiter for file upload endpoints
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 file uploads per 15 minutes
    message: 'Too many file uploads, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many file uploads, please try again after 15 minutes');
    }
});

// Rate limiter for job application submissions
export const applicationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Limit each user to 30 applications per hour
    message: 'Too many job applications submitted, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many job applications submitted, please try again after an hour');
    }
});

// Rate limiter for job/drive creation by companies
export const jobCreationLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 50, // Limit each company to 50 job postings per day
    message: 'Too many job postings created, please try again tomorrow',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many job postings created, please try again tomorrow');
    }
});

// Rate limiter for referral creation
export const referralLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // Limit each alumni to 10 referrals per day
    message: 'Too many referrals submitted, please try again tomorrow',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many referrals submitted, please try again tomorrow');
    }
});

// Rate limiter for mentorship requests
export const mentorshipLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5, // Limit each student to 5 mentorship requests per day
    message: 'Too many mentorship requests, please try again tomorrow',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many mentorship requests, please try again tomorrow');
    }
});

// Rate limiter for event registration
export const eventRegistrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each user to 20 event registrations per hour
    message: 'Too many event registrations, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many event registrations, please try again after an hour');
    }
});

// Rate limiter for analytics generation
export const analyticsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit to 10 analytics generations per hour
    message: 'Too many analytics requests, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many analytics requests, please try again after an hour');
    }
});

// Rate limiter for search/query endpoints
export const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 search requests per minute
    message: 'Too many search requests, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many search requests, please slow down');
    }
});

// Rate limiter for bulk operations
export const bulkOperationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit to 5 bulk operations per hour
    message: 'Too many bulk operations, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, 'Too many bulk operations, please try again after an hour');
    }
});

// Custom rate limiter factory for specific use cases
export const createCustomLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            throw new ApiError(429, message);
        }
    });
};
