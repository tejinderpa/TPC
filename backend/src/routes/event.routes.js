import {Router} from "express";
import {
    registerForEvent,
    getMyEvents,
    updateAttendanceStatus,
    uploadEventCertificate,
    submitEventFeedback,
    getEventById,
    getAllEvents,
    deleteEvent
} from "../controllers/event.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Student routes
router.route("/register").post(registerForEvent);
router.route("/my-events").get(getMyEvents);
router.route("/feedback/:eventId").post(submitEventFeedback);

// General routes
router.route("/all").get(getAllEvents);
router.route("/:eventId").get(getEventById);

// TPO/Admin routes
router.route("/attendance/:eventId").patch(updateAttendanceStatus);
router.route("/certificate/:eventId").patch(
    upload.single("certificate"),
    uploadEventCertificate
);
router.route("/delete/:eventId").delete(deleteEvent);

export default router;
