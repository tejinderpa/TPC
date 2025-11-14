import {Router} from "express";
import {
    createShortlist,
    getShortlistById,
    getAllShortlists,
    getJobShortlists,
    updateShortlistStatus,
    scheduleInterview,
    submitFeedback,
    bulkShortlist,
    deleteShortlist
} from "../controllers/shortlist.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Company/TPO routes
router.route("/create").post(createShortlist);
router.route("/bulk-create").post(bulkShortlist);
router.route("/status/:shortlistId").patch(updateShortlistStatus);
router.route("/schedule-interview/:shortlistId").patch(scheduleInterview);
router.route("/feedback/:shortlistId").post(submitFeedback);

// General routes
router.route("/all").get(getAllShortlists);
router.route("/:shortlistId").get(getShortlistById);
router.route("/job/:jobId").get(getJobShortlists);

// Admin routes
router.route("/delete/:shortlistId").delete(deleteShortlist);

export default router;
