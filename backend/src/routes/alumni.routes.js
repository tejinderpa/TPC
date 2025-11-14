import {Router} from "express";
import {
    registerAlumni,
    loginAlumni,
    logoutAlumni,
    refreshAccessToken,
    getCurrentAlumni,
    updateAlumniDetails,
    updateAlumniAvatar,
    changePassword,
    getAlumniById,
    getAllAlumni,
    updateMentorAvailability,
    verifyAlumni,
    deactivateAlumni,
    deleteAlumni
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
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/current-alumni").get(verifyJWT, getCurrentAlumni);
router.route("/update-details").patch(verifyJWT, updateAlumniDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAlumniAvatar);
router.route("/mentor-availability").patch(verifyJWT, updateMentorAvailability);

// General routes
router.route("/all").get(verifyJWT, getAllAlumni);
router.route("/:alumniId").get(verifyJWT, getAlumniById);

// TPO/Admin routes
router.route("/verify/:alumniId").patch(verifyJWT, verifyAlumni);
router.route("/deactivate/:alumniId").patch(verifyJWT, deactivateAlumni);
router.route("/delete/:alumniId").delete(verifyJWT, deleteAlumni);

export default router;
