import {Router} from "express";
import {
    createDrive,
    getDriveById,
    getAllDrives,
    getCompanyDrives,
    updateDrive,
    updateDriveStatus,
    getDriveStatistics,
    deleteDrive
} from "../controllers/drive.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Company/TPO routes
router.route("/create").post(createDrive);
router.route("/update/:driveId").patch(updateDrive);
router.route("/status/:driveId").patch(updateDriveStatus);

// Company specific routes
router.route("/my-drives").get(getCompanyDrives);

// General routes
router.route("/all").get(getAllDrives);
router.route("/:driveId").get(getDriveById);
router.route("/statistics/:driveId").get(getDriveStatistics);

// Admin routes
router.route("/delete/:driveId").delete(deleteDrive);

export default router;
