import express from "express"
const router = express.Router();
import authController from "../controllers/auth"
import homeController from "../controllers/home"
import postsController from "../controllers/posts"
import leaderboardController  from "../controllers/leaderboardController"
import upload from "../middleware/multer"
import authMiddleware from "../middleware/auth"

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/profile/:id", authMiddleware.ensureAuth, postsController.getProfile);
router.get("/editProfile/:id", authMiddleware.ensureAuth, authMiddleware.ensureUser, postsController.editProfile)
router.get("/feed", authMiddleware.ensureAuth, postsController.getFeed);
router.get('/leaderboard', authMiddleware.ensureAuth, leaderboardController.getLeaderboard);
router.get("/postMenu", authMiddleware.ensureAuth, postsController.getPostMenu)
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", upload.single("file"), authController.postSignup);

export default router;
