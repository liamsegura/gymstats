const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuth, ensureGuest } = require("../middleware/auth");

// Follow a user
router.post('/:userId/follow/:userToFollowId', userController.followUser);

// Unfollow a user
router.delete('/:userId/unfollow/:userToUnfollowId', userController.unfollowUser);

module.exports = router;

