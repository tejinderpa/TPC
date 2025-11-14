import {Router} from "express";
import {
    registerCompany,
    loginCompany,
    logoutCompany,
    refreshAccessToken,
    getCurrentCompany,
    updateCompanyDetails,
    updateCompanyLogo,
    changePassword,
    getCompanyById,
    getAllCompanies,
    verifyCompany,
    deactivateCompany
} from "../controllers/company.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(
    upload.single("logo"),
    registerCompany
);
router.route("/login").post(loginCompany);

// Secured routes
router.route("/logout").post(verifyJWT, logoutCompany);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/current-company").get(verifyJWT, getCurrentCompany);
router.route("/update-details").patch(verifyJWT, updateCompanyDetails);
router.route("/logo").patch(verifyJWT, upload.single("logo"), updateCompanyLogo);

// General routes
router.route("/all").get(verifyJWT, getAllCompanies);
router.route("/:companyId").get(verifyJWT, getCompanyById);

// TPO/Admin routes
router.route("/verify/:companyId").patch(verifyJWT, verifyCompany);
router.route("/deactivate/:companyId").patch(verifyJWT, deactivateCompany);

export default router;
