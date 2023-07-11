import express from 'express'
const router = express.Router();
import userController from '../controllers/userController'
import upload from "../middleware/multer"


// Follow a user
router.post('/:userId/follow/:userToFollowId', userController.followUser);

router.get("/:userId/followers", userController.getFollowers);

router.get("/notifications", userController.getNotifications);

router.put("/saveProfile/:id", userController.saveProfile);

router.put("/saveProfilePic/:id", upload.single("file"), userController.saveProfilePic);

// Unfollow a user
router.delete('/:userId/unfollow/:userToUnfollowId', userController.unfollowUser);

export default router;

