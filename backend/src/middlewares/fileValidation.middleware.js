import { ApiError } from "../utils/ApiError.js";

// File type validation configurations
const fileValidations = {
    image: {
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        maxSize: 5 * 1024 * 1024, // 5MB
        errorMessage: 'Only JPEG, PNG, WEBP, and GIF images are allowed (max 5MB)'
    },
    pdf: {
        allowedTypes: ['application/pdf'],
        maxSize: 10 * 1024 * 1024, // 10MB
        errorMessage: 'Only PDF files are allowed (max 10MB)'
    },
    resume: {
        allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maxSize: 5 * 1024 * 1024, // 5MB
        errorMessage: 'Only PDF and DOC/DOCX files are allowed for resumes (max 5MB)'
    },
    document: {
        allowedTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        maxSize: 10 * 1024 * 1024, // 10MB
        errorMessage: 'Only PDF, DOC, DOCX, XLS, and XLSX files are allowed (max 10MB)'
    },
    certificate: {
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        maxSize: 5 * 1024 * 1024, // 5MB
        errorMessage: 'Only PDF and image files are allowed for certificates (max 5MB)'
    },
    logo: {
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
        maxSize: 2 * 1024 * 1024, // 2MB
        errorMessage: 'Only JPEG, PNG, WEBP, and SVG images are allowed for logos (max 2MB)'
    },
    avatar: {
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        maxSize: 2 * 1024 * 1024, // 2MB
        errorMessage: 'Only JPEG, PNG, and WEBP images are allowed for avatars (max 2MB)'
    }
};

// Generic file validation middleware factory
export const validateFile = (fileType = 'image', fieldName = 'file') => {
    return (req, res, next) => {
        try {
            const validation = fileValidations[fileType];
            
            if (!validation) {
                throw new ApiError(500, `Invalid file validation type: ${fileType}`);
            }

            // Check if file exists
            const file = req.file || req.files?.[fieldName]?.[0];
            
            if (!file) {
                // If no file is uploaded, skip validation (make it optional)
                return next();
            }

            // Validate file type
            if (!validation.allowedTypes.includes(file.mimetype)) {
                throw new ApiError(400, validation.errorMessage);
            }

            // Validate file size
            if (file.size > validation.maxSize) {
                throw new ApiError(400, validation.errorMessage);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Specific file validation middlewares
export const validateImage = validateFile('image', 'image');
export const validatePDF = validateFile('pdf', 'pdf');
export const validateResume = validateFile('resume', 'resume');
export const validateDocument = validateFile('document', 'document');
export const validateCertificate = validateFile('certificate', 'certificate');
export const validateLogo = validateFile('logo', 'logo');
export const validateAvatar = validateFile('avatar', 'avatar');

// Multiple files validation middleware
export const validateMultipleFiles = (fileType = 'image', fieldName = 'files', maxCount = 10) => {
    return (req, res, next) => {
        try {
            const validation = fileValidations[fileType];
            
            if (!validation) {
                throw new ApiError(500, `Invalid file validation type: ${fileType}`);
            }

            // Check if files exist
            const files = req.files?.[fieldName] || req.files || [];
            
            if (!files || files.length === 0) {
                // If no files are uploaded, skip validation
                return next();
            }

            // Check max count
            if (files.length > maxCount) {
                throw new ApiError(400, `Maximum ${maxCount} files allowed`);
            }

            // Validate each file
            for (const file of files) {
                // Validate file type
                if (!validation.allowedTypes.includes(file.mimetype)) {
                    throw new ApiError(400, `Invalid file type for ${file.originalname}. ${validation.errorMessage}`);
                }

                // Validate file size
                if (file.size > validation.maxSize) {
                    throw new ApiError(400, `File ${file.originalname} exceeds size limit. ${validation.errorMessage}`);
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// File validation for company registration documents
export const validateCompanyDocuments = (req, res, next) => {
    try {
        const logo = req.file || req.files?.logo?.[0];
        
        if (logo) {
            const logoValidation = fileValidations.logo;
            
            if (!logoValidation.allowedTypes.includes(logo.mimetype)) {
                throw new ApiError(400, logoValidation.errorMessage);
            }
            
            if (logo.size > logoValidation.maxSize) {
                throw new ApiError(400, logoValidation.errorMessage);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

// File validation for student profile
export const validateStudentFiles = (req, res, next) => {
    try {
        const avatar = req.files?.avatar?.[0];
        const resume = req.files?.resume?.[0];
        
        if (avatar) {
            const avatarValidation = fileValidations.avatar;
            
            if (!avatarValidation.allowedTypes.includes(avatar.mimetype)) {
                throw new ApiError(400, avatarValidation.errorMessage);
            }
            
            if (avatar.size > avatarValidation.maxSize) {
                throw new ApiError(400, avatarValidation.errorMessage);
            }
        }

        if (resume) {
            const resumeValidation = fileValidations.resume;
            
            if (!resumeValidation.allowedTypes.includes(resume.mimetype)) {
                throw new ApiError(400, resumeValidation.errorMessage);
            }
            
            if (resume.size > resumeValidation.maxSize) {
                throw new ApiError(400, resumeValidation.errorMessage);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

// File validation for event posters
export const validateEventPoster = validateFile('image', 'poster');

// Custom file validation with specific requirements
export const validateCustomFile = (allowedTypes, maxSize, errorMessage) => {
    return (req, res, next) => {
        try {
            const file = req.file;
            
            if (!file) {
                return next();
            }

            if (!allowedTypes.includes(file.mimetype)) {
                throw new ApiError(400, errorMessage || 'Invalid file type');
            }

            if (file.size > maxSize) {
                throw new ApiError(400, errorMessage || `File size exceeds ${maxSize / 1024 / 1024}MB limit`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
