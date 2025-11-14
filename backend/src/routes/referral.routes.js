import {Router} from "express";
import {
    createReferral,
    getReferralById,
    getAllReferrals,
    getMyReferrals,
    updateReferralStatus,
    addReferralUpdate,
    deleteReferral
} from "../controllers/referral.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Alumni routes
router.route("/create").post(createReferral);
router.route("/my-referrals").get(getMyReferrals);
router.route("/add-update/:referralId").post(addReferralUpdate);

// General routes
router.route("/all").get(getAllReferrals);
router.route("/:referralId").get(getReferralById);

// Company/TPO routes
router.route("/status/:referralId").patch(updateReferralStatus);

// Admin routes
router.route("/delete/:referralId").delete(deleteReferral);

export default router;
