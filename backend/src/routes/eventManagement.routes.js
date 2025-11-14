import {Router} from "express";
import {
    createEventForAllStudents,
    bulkUpdateAttendance,
    getEventParticipants,
    uploadBulkCertificates,
    getEventReport,
    getUpcomingEvents,
    deleteEvent,
    sendEventReminders
} from "../controllers/eventManagement.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication and TPO access
router.use(verifyJWT);

// TPO/Admin routes
router.route("/create-for-all").post(createEventForAllStudents);
router.route("/bulk-attendance").post(bulkUpdateAttendance);
router.route("/participants").get(getEventParticipants);
router.route("/bulk-certificates").post(uploadBulkCertificates);
router.route("/report").get(getEventReport);
router.route("/upcoming").get(getUpcomingEvents);
router.route("/send-reminders").post(sendEventReminders);
router.route("/delete").delete(deleteEvent);

export default router;
