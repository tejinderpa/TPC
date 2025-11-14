import {Router} from "express";
import {
    createShortlist,
    getShortlistById,
    getAllShortlists,
    updateShortlistStatus,
    scheduleInterview,
    addFeedback,
    deleteShortlist
} from "../controllers/shortlist.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Company/TPO routes
router.route("/create").post(createShortlist);
router.route("/status/:shortlistId").patch(updateShortlistStatus);
router.route("/schedule-interview/:shortlistId").patch(scheduleInterview);
router.route("/feedback/:shortlistId").post(addFeedback);

// General routes
router.route("/all").get(getAllShortlists);
router.route("/:shortlistId").get(getShortlistById);

// Admin routes
router.route("/delete/:shortlistId").delete(deleteShortlist);

export default router;
