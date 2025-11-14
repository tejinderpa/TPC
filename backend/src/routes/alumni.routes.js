import {Router} from "express";
import {
    registerAlumni,
    loginAlumni,
    logoutAlumni,
    getCurrentAlumni,
    updateAlumniProfile,
    updateAlumniAvatar,
    getAlumniById,
    getAllAlumni,
    verifyAlumni,
    deactivateAlumni
} from "../controllers/alumni.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(
    upload.single("avatar"),
    registerAlumni
);
router.route("/login").post(loginAlumni);

// Secured routes
router.route("/logout").post(verifyJWT, logoutAlumni);
router.route("/current-alumni").get(verifyJWT, getCurrentAlumni);
router.route("/update-details").patch(verifyJWT, updateAlumniProfile);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAlumniAvatar);

// General routes
router.route("/all").get(verifyJWT, getAllAlumni);
router.route("/:alumniId").get(verifyJWT, getAlumniById);

// TPO/Admin routes
router.route("/verify/:alumniId").patch(verifyJWT, verifyAlumni);
router.route("/deactivate/:alumniId").patch(verifyJWT, deactivateAlumni);

export default router;
