const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuth, ensureGuest } = require("../middleware/auth");
const upload = require("../middleware/multer");

// Follow a user
router.post('/:userId/follow/:userToFollowId', userController.followUser);

router.put("/saveProfile/:id", userController.saveProfile);

router.put("/saveProfilePic/:id", upload.single("file"), userController.saveProfilePic);

// Unfollow a user
router.delete('/:userId/unfollow/:userToUnfollowId', userController.unfollowUser);

module.exports = router;

