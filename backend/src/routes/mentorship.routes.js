import {Router} from "express";
import {
    requestMentorship,
    respondToMentorshipRequest,
    getMentorshipById,
    getStudentMentorships,
    getAlumniMentorships,
    addMentorshipSession,
    updateMentorshipGoal,
    completeMentorship,
    deleteMentorship
} from "../controllers/mentorship.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Student routes
router.route("/request").post(requestMentorship);
router.route("/my-mentorships").get(getStudentMentorships);

// Alumni routes
router.route("/respond/:mentorshipId").patch(respondToMentorshipRequest);
router.route("/my-mentees").get(getAlumniMentorships);
router.route("/add-session/:mentorshipId").post(addMentorshipSession);

// Shared routes
router.route("/:mentorshipId").get(getMentorshipById);
router.route("/update-goal/:mentorshipId").patch(updateMentorshipGoal);
router.route("/complete/:mentorshipId").patch(completeMentorship);

// Admin routes
router.route("/delete/:mentorshipId").delete(deleteMentorship);

export default router;
