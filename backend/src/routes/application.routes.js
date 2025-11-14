import {Router} from "express";
import {
    createApplication,
    getApplicationById,
    getAllApplications,
    getStudentApplications,
    updateApplicationStatus,
    addInterviewRound,
    updateInterviewRound,
    submitOffer,
    respondToOffer,
    withdrawApplication,
    deleteApplication
} from "../controllers/application.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Student routes
router.route("/create").post(createApplication);
router.route("/my-applications").get(getStudentApplications);
router.route("/withdraw/:applicationId").patch(withdrawApplication);
router.route("/offer-response/:applicationId").patch(respondToOffer);

// General routes
router.route("/all").get(getAllApplications);
router.route("/:applicationId").get(getApplicationById);

// Company/TPO routes
router.route("/status/:applicationId").patch(updateApplicationStatus);
router.route("/interview-round/:applicationId").post(addInterviewRound);
router.route("/interview-round/:applicationId/:roundId").patch(updateInterviewRound);
router.route("/offer/:applicationId").post(submitOffer);
router.route("/delete/:applicationId").delete(deleteApplication);

export default router;
