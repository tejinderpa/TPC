import {Router} from "express";
import {
    createReward,
    getMyRewards,
    getRewardLeaderboard,
    getRewardById,
    getAllRewards,
    getRewardStatistics,
    deleteReward
} from "../controllers/reward.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Student routes
router.route("/my-rewards").get(getMyRewards);
router.route("/leaderboard").get(getRewardLeaderboard);
router.route("/statistics").get(getRewardStatistics);

// General routes
router.route("/all").get(getAllRewards);
router.route("/:rewardId").get(getRewardById);

// TPO/Admin routes
router.route("/create").post(createReward);
router.route("/delete/:rewardId").delete(deleteReward);

export default router;
