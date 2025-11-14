import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Student } from "../models/student.models.js";
import { Company } from "../models/company.models.js";
import { Alumni } from "../models/alumni.models.js";
import { TPO } from "../models/tpo.models.js";

// Middleware to check if user is a Student
export const isStudent = asyncHandler(async (req, _, next) => {
    if (!req.user && !req.student) {
        throw new ApiError(401, "Unauthorized request");
    }

    const studentId = req.student?._id || req.user?._id;
    const student = await Student.findById(studentId);

    if (!student) {
        throw new ApiError(403, "Access denied. Student account required.");
    }

    if (!student.isActive) {
        throw new ApiError(403, "Access denied. Student account is inactive.");
    }

    req.student = student;
    next();
});

// Middleware to check if user is a Company HR
export const isCompany = asyncHandler(async (req, _, next) => {
    if (!req.user && !req.company) {
        throw new ApiError(401, "Unauthorized request");
    }

    const companyId = req.company?._id || req.user?._id;
    const company = await Company.findById(companyId);

    if (!company) {
        throw new ApiError(403, "Access denied. Company account required.");
    }

    if (!company.isActive) {
        throw new ApiError(403, "Access denied. Company account is inactive.");
    }

    if (!company.isVerified) {
        throw new ApiError(403, "Access denied. Company account is not verified.");
    }

    req.company = company;
    next();
});

// Middleware to check if user is an Alumni
export const isAlumni = asyncHandler(async (req, _, next) => {
    if (!req.user && !req.alumni) {
        throw new ApiError(401, "Unauthorized request");
    }

    const alumniId = req.alumni?._id || req.user?._id;
    const alumni = await Alumni.findById(alumniId);

    if (!alumni) {
        throw new ApiError(403, "Access denied. Alumni account required.");
    }

    if (!alumni.isActive) {
        throw new ApiError(403, "Access denied. Alumni account is inactive.");
    }

    if (!alumni.isVerified) {
        throw new ApiError(403, "Access denied. Alumni account is not verified.");
    }

    req.alumni = alumni;
    next();
});

// Middleware to check if user is a TPO
export const isTPO = asyncHandler(async (req, _, next) => {
    if (!req.user && !req.tpo) {
        throw new ApiError(401, "Unauthorized request");
    }

    const tpoId = req.tpo?._id || req.user?._id;
    const tpo = await TPO.findById(tpoId);

    if (!tpo) {
        throw new ApiError(403, "Access denied. TPO account required.");
    }

    if (!tpo.isActive) {
        throw new ApiError(403, "Access denied. TPO account is inactive.");
    }

    req.tpo = tpo;
    next();
});

// Middleware to check if TPO has specific role
export const hasTPORole = (...allowedRoles) => {
    return asyncHandler(async (req, _, next) => {
        if (!req.tpo) {
            throw new ApiError(401, "Unauthorized request");
        }

        if (!allowedRoles.includes(req.tpo.role)) {
            throw new ApiError(403, `Access denied. Required role: ${allowedRoles.join(" or ")}`);
        }

        next();
    });
};

// Middleware to check if TPO has specific permissions
export const hasTPOPermission = (...requiredPermissions) => {
    return asyncHandler(async (req, _, next) => {
        if (!req.tpo) {
            throw new ApiError(401, "Unauthorized request");
        }

        const hasPermissions = requiredPermissions.every(permission =>
            req.tpo.permissions.includes(permission)
        );

        if (!hasPermissions) {
            throw new ApiError(403, `Access denied. Required permissions: ${requiredPermissions.join(", ")}`);
        }

        next();
    });
};

// Middleware to check if user is either Student or Alumni (for certain shared features)
export const isStudentOrAlumni = asyncHandler(async (req, _, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const userId = req.user._id;
    
    const student = await Student.findById(userId);
    const alumni = await Alumni.findById(userId);

    if (!student && !alumni) {
        throw new ApiError(403, "Access denied. Student or Alumni account required.");
    }

    if (student) {
        if (!student.isActive) {
            throw new ApiError(403, "Access denied. Student account is inactive.");
        }
        req.student = student;
    }

    if (alumni) {
        if (!alumni.isActive) {
            throw new ApiError(403, "Access denied. Alumni account is inactive.");
        }
        req.alumni = alumni;
    }

    next();
});

// Middleware to check if user is either Company or TPO (for job/drive management)
export const isCompanyOrTPO = asyncHandler(async (req, _, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const userId = req.user._id;
    
    const company = await Company.findById(userId);
    const tpo = await TPO.findById(userId);

    if (!company && !tpo) {
        throw new ApiError(403, "Access denied. Company or TPO account required.");
    }

    if (company) {
        if (!company.isActive) {
            throw new ApiError(403, "Access denied. Company account is inactive.");
        }
        req.company = company;
    }

    if (tpo) {
        if (!tpo.isActive) {
            throw new ApiError(403, "Access denied. TPO account is inactive.");
        }
        req.tpo = tpo;
    }

    next();
});

// Middleware for TPO Admin only
export const isTPOAdmin = asyncHandler(async (req, _, next) => {
    if (!req.tpo) {
        throw new ApiError(401, "Unauthorized request");
    }

    if (req.tpo.role !== 'Admin' && req.tpo.role !== 'Super Admin') {
        throw new ApiError(403, "Access denied. TPO Admin access required.");
    }

    next();
});
