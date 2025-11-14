import {Router} from "express";
import {
    createJob,
    getJobById,
    getAllJobs,
    getCompanyJobs,
    updateJob,
    publishJob,
    closeJob,
    getEligibleStudents,
    getJobStatistics,
    deleteJob
} from "../controllers/job.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Company routes
router.route("/create").post(createJob);
router.route("/my-jobs").get(getCompanyJobs);
router.route("/update/:jobId").patch(updateJob);
router.route("/publish/:jobId").patch(publishJob);
router.route("/close/:jobId").patch(closeJob);

// General routes
router.route("/all").get(getAllJobs);
router.route("/:jobId").get(getJobById);
router.route("/eligible-students/:jobId").get(getEligibleStudents);
router.route("/statistics/:jobId").get(getJobStatistics);

// Admin routes
router.route("/delete/:jobId").delete(deleteJob);

export default router;
