import {Router} from "express";
import {
    registerStudent,
    loginStudent,
    logoutStudent,
    refreshAccessToken,
    getCurrentStudent,
    updateStudentDetails,
    updateStudentAvatar,
    changePassword,
    getStudentById,
    getAllStudents,
    markStudentPlaced,
    updatePlacementDetails,
    deactivateStudent,
    deleteStudent
} from "../controllers/student.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "resume", maxCount: 1}
    ]),
    registerStudent
);
router.route("/login").post(loginStudent);

// Secured routes
router.route("/logout").post(verifyJWT, logoutStudent);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/current-student").get(verifyJWT, getCurrentStudent);
router.route("/update-details").patch(verifyJWT, updateStudentDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateStudentAvatar);

// Admin/TPO routes
router.route("/all").get(verifyJWT, getAllStudents);
router.route("/:studentId").get(verifyJWT, getStudentById);
router.route("/mark-placed/:studentId").patch(verifyJWT, markStudentPlaced);
router.route("/placement-details/:studentId").patch(verifyJWT, updatePlacementDetails);
router.route("/deactivate/:studentId").patch(verifyJWT, deactivateStudent);
router.route("/delete/:studentId").delete(verifyJWT, deleteStudent);

export default router;
