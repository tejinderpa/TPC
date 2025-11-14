import {Router} from "express";
import {
    createApplication,
    getApplicationById,
    getMyApplications,
    updateApplicationStatus,
    addInterviewRound,
    updateInterviewRound,
    addOfferDetails,
    withdrawApplication,
    getApplicationsByJob,
    deleteApplication
} from "../controllers/application.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Student routes
router.route("/create").post(createApplication);
router.route("/my-applications").get(getMyApplications);
router.route("/withdraw/:applicationId").patch(withdrawApplication);

// General routes
router.route("/:applicationId").get(getApplicationById);
router.route("/job/:jobId").get(getApplicationsByJob);

// Company/TPO routes
router.route("/status/:applicationId").patch(updateApplicationStatus);
router.route("/interview-round/:applicationId").post(addInterviewRound);
router.route("/interview-round/:applicationId/:roundId").patch(updateInterviewRound);
router.route("/offer/:applicationId").post(addOfferDetails);
router.route("/delete/:applicationId").delete(deleteApplication);

export default router;
