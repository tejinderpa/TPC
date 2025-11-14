import {Router} from "express";
import {
    createJob,
    getJobById,
    getAllJobs,
    getEligibleJobs,
    updateJob,
    publishJob,
    closeJob,
    getJobStatistics,
    deleteJob
} from "../controllers/job.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Company routes
router.route("/create").post(createJob);
router.route("/update/:jobId").patch(updateJob);
router.route("/publish/:jobId").patch(publishJob);
router.route("/close/:jobId").patch(closeJob);

// General routes
router.route("/all").get(getAllJobs);
router.route("/eligible").get(getEligibleJobs);
router.route("/:jobId").get(getJobById);
router.route("/statistics/:jobId").get(getJobStatistics);

// Admin routes
router.route("/delete/:jobId").delete(deleteJob);

export default router;
