import {Router} from "express";
import {
    registerForEvent,
    getStudentEvents,
    updateAttendance,
    uploadCertificate,
    submitFeedback,
    getEventById,
    getAllEvents,
    deleteEventParticipation
} from "../controllers/event.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Student routes
router.route("/register").post(registerForEvent);
router.route("/my-events").get(getStudentEvents);
router.route("/feedback/:eventId").post(submitFeedback);

// General routes
router.route("/all").get(getAllEvents);
router.route("/:eventId").get(getEventById);

// TPO/Admin routes
router.route("/attendance/:eventId").patch(updateAttendance);
router.route("/certificate/:eventId").patch(
    upload.single("certificate"),
    uploadCertificate
);
router.route("/delete/:eventId").delete(deleteEventParticipation);

export default router;
