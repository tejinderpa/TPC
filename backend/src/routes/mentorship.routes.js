import {Router} from "express";
import {
    requestMentorship,
    respondToMentorshipRequest,
    getMentorshipById,
    getMyMentorships,
    addSession,
    completeMentorship,
    cancelMentorship
} from "../controllers/mentorship.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Student routes
router.route("/request").post(requestMentorship);
router.route("/my-mentorships").get(getMyMentorships);

// Alumni routes
router.route("/respond/:mentorshipId").patch(respondToMentorshipRequest);
router.route("/add-session/:mentorshipId").post(addSession);

// Shared routes
router.route("/:mentorshipId").get(getMentorshipById);
router.route("/complete/:mentorshipId").patch(completeMentorship);
router.route("/cancel/:mentorshipId").patch(cancelMentorship);

export default router;
