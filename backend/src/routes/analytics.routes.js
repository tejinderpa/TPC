import {Router} from "express";
import {
    generateAnalytics,
    getAnalyticsById,
    getAllAnalytics,
    getLatestAnalytics,
    getDashboardSummary,
    updateAnalyticsVisibility,
    deleteAnalytics
} from "../controllers/analytics.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// TPO/Admin routes
router.route("/generate").post(generateAnalytics);
router.route("/dashboard").get(getDashboardSummary);
router.route("/latest").get(getLatestAnalytics);
router.route("/all").get(getAllAnalytics);
router.route("/:analyticsId").get(getAnalyticsById);
router.route("/visibility/:analyticsId").patch(updateAnalyticsVisibility);
router.route("/delete/:analyticsId").delete(deleteAnalytics);

export default router;
