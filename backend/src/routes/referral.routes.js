import {Router} from "express";
import {
    createReferral,
    getReferralById,
    getAllReferrals,
    getAlumniReferrals,
    getStudentReferrals,
    updateReferralStatus,
    addReferralNote,
    deleteReferral
} from "../controllers/referral.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Alumni routes
router.route("/create").post(createReferral);
router.route("/my-referrals").get(getAlumniReferrals);
router.route("/add-note/:referralId").post(addReferralNote);

// Student routes
router.route("/student-referrals").get(getStudentReferrals);

// General routes
router.route("/all").get(getAllReferrals);
router.route("/:referralId").get(getReferralById);

// Company/TPO routes
router.route("/status/:referralId").patch(updateReferralStatus);

// Admin routes
router.route("/delete/:referralId").delete(deleteReferral);

export default router;
