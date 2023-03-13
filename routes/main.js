const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const leaderboardController  = require("../controllers/leaderboardController");
const upload = require("../middleware/multer");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/profile/:id", ensureAuth, postsController.getProfile);
router.get("/editProfile/:id", ensureAuth, postsController.editProfile)
router.get("/feed", ensureAuth, postsController.getFeed);
router.get('/leaderboard', ensureAuth, leaderboardController.getLeaderboard);
router.get("/postMenu", ensureAuth, postsController.getPostMenu)
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", upload.single("file"), authController.postSignup);

module.exports = router;
