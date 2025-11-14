export const DB_NAME = 'tpc_placement'

// User Roles
export const USER_ROLES = {
    STUDENT: "student",
    COMPANY: "company",
    ALUMNI: "alumni",
    TPO: "tpo"
};

// TPO Roles
export const TPO_ROLES = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    COORDINATOR: "Coordinator",
    ASSISTANT: "Assistant"
};

// Job Types
export const JOB_TYPES = {
    FULL_TIME: "Full-Time",
    INTERNSHIP: "Internship",
    PART_TIME: "Part-Time",
    CONTRACT: "Contract"
};

// Job Status
export const JOB_STATUS = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    CLOSED: "Closed",
    ON_HOLD: "On Hold"
};

// Application Status
export const APPLICATION_STATUS = {
    APPLIED: "Applied",
    UNDER_REVIEW: "Under Review",
    SHORTLISTED: "Shortlisted",
    INTERVIEW_SCHEDULED: "Interview Scheduled",
    REJECTED: "Rejected",
    SELECTED: "Selected",
    OFFER_ACCEPTED: "Offer Accepted",
    OFFER_DECLINED: "Offer Declined",
    WITHDRAWN: "Withdrawn"
};

// Drive Status
export const DRIVE_STATUS = {
    UPCOMING: "Upcoming",
    ONGOING: "Ongoing",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    POSTPONED: "Postponed"
};

// Event Types
export const EVENT_TYPES = {
    WORKSHOP: "Workshop",
    SEMINAR: "Seminar",
    WEBINAR: "Webinar",
    CAREER_FAIR: "Career Fair",
    HACKATHON: "Hackathon",
    COMPETITION: "Competition",
    GUEST_LECTURE: "Guest Lecture",
    TRAINING: "Training Session",
    MEETUP: "Alumni Meetup",
    OTHER: "Other"
};

// Event Attendance Status
export const ATTENDANCE_STATUS = {
    REGISTERED: "Registered",
    ATTENDED: "Attended",
    ABSENT: "Absent",
    CANCELLED: "Cancelled"
};

// Reward Types
export const REWARD_TYPES = {
    EVENT_PARTICIPATION: "Event Participation",
    EVENT_ATTENDANCE: "Event Attendance",
    JOB_APPLICATION: "Job Application",
    PLACEMENT: "Placement",
    PROFILE_COMPLETION: "Profile Completion",
    REFERRAL: "Referral",
    MENTORSHIP: "Mentorship",
    ACADEMIC_ACHIEVEMENT: "Academic Achievement",
    CERTIFICATION: "Certification",
    HACKATHON: "Hackathon",
    COMPETITION: "Competition",
    INTERNSHIP: "Internship"
};

// Branches
export const BRANCHES = {
    CSE: "Computer Science Engineering",
    IT: "Information Technology",
    ECE: "Electronics & Communication Engineering",
    EE: "Electrical Engineering",
    ME: "Mechanical Engineering",
    CE: "Civil Engineering",
    CH: "Chemical Engineering",
    BT: "Biotechnology",
    AE: "Aerospace Engineering",
    PIE: "Production & Industrial Engineering"
};

// Shortlist Status
export const SHORTLIST_STATUS = {
    SHORTLISTED: "Shortlisted",
    INTERVIEW_SCHEDULED: "Interview Scheduled",
    INTERVIEW_COMPLETED: "Interview Completed",
    SELECTED: "Selected",
    REJECTED: "Rejected",
    ON_HOLD: "On Hold"
};

// Mentorship Status
export const MENTORSHIP_STATUS = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled"
};

// Referral Status
export const REFERRAL_STATUS = {
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    SHORTLISTED: "Shortlisted",
    INTERVIEW_SCHEDULED: "Interview Scheduled",
    SELECTED: "Selected",
    REJECTED: "Rejected",
    EXPIRED: "Expired"
};

// Analytics Types
export const ANALYTICS_TYPES = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    QUARTERLY: "Quarterly",
    YEARLY: "Yearly",
    CUSTOM: "Custom"
};

// Interview Modes
export const INTERVIEW_MODES = {
    ONLINE: "Online",
    OFFLINE: "Offline",
    HYBRID: "Hybrid",
    TELEPHONIC: "Telephonic"
};

// Offer Status
export const OFFER_STATUS = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    EXPIRED: "Expired"
};

// Company Verification Status
export const COMPANY_STATUS = {
    PENDING: "Pending Verification",
    VERIFIED: "Verified",
    REJECTED: "Rejected",
    BLACKLISTED: "Blacklisted"
};

// TPO Permissions
export const TPO_PERMISSIONS = {
    MANAGE_STUDENTS: "manage_students",
    MANAGE_COMPANIES: "manage_companies",
    MANAGE_JOBS: "manage_jobs",
    MANAGE_DRIVES: "manage_drives",
    MANAGE_APPLICATIONS: "manage_applications",
    MANAGE_EVENTS: "manage_events",
    MANAGE_REWARDS: "manage_rewards",
    MANAGE_TPO: "manage_tpo",
    VIEW_ANALYTICS: "view_analytics",
    GENERATE_REPORTS: "generate_reports",
    MANAGE_ALUMNI: "manage_alumni",
    SEND_NOTIFICATIONS: "send_notifications"
};

// Skill Levels
export const SKILL_LEVELS = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    EXPERT: "Expert"
};

// Employment Types for Alumni
export const EMPLOYMENT_TYPES = {
    FULL_TIME: "Full-Time",
    PART_TIME: "Part-Time",
    FREELANCE: "Freelance",
    SELF_EMPLOYED: "Self-Employed",
    UNEMPLOYED: "Unemployed"
};