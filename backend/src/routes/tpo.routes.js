import {Router} from "express";
import {
    registerTPO,
    loginTPO,
    logoutTPO,
    getCurrentTPO,
    updateTPODetails,
    updateTPOAvatar,
    changePassword,
    getTPOById,
    getAllTPO,
    updateTPOPermissions,
    updateTPORole,
    assignBranchesAndBatches,
    deactivateTPO,
    deleteTPO
} from "../controllers/tpo.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(
    upload.single("avatar"),
    registerTPO
);
router.route("/login").post(loginTPO);

// Secured routes
router.route("/logout").post(verifyJWT, logoutTPO);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/current-tpo").get(verifyJWT, getCurrentTPO);
router.route("/update-details").patch(verifyJWT, updateTPODetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateTPOAvatar);

// Admin routes
router.route("/all").get(verifyJWT, getAllTPO);
router.route("/:tpoId").get(verifyJWT, getTPOById);
router.route("/permissions/:tpoId").patch(verifyJWT, updateTPOPermissions);
router.route("/role/:tpoId").patch(verifyJWT, updateTPORole);
router.route("/assign-branches/:tpoId").patch(verifyJWT, assignBranchesAndBatches);
router.route("/deactivate/:tpoId").patch(verifyJWT, deactivateTPO);
router.route("/delete/:tpoId").delete(verifyJWT, deleteTPO);

export default router;
