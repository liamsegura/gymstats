import express from "express"
const router = express.Router();
import upload from "../middleware/multer"
import postsController from "../controllers/posts"
import authMiddleware from '../middleware/auth';


//Post Routes - simplified for now
router.get("/:id", authMiddleware.ensureAuth, postsController.getPost);

router.get("/:id/likes", authMiddleware.ensureAuth, postsController.getLikes);

router.post("/createPost", upload.single("media"), postsController.createPost);

router.post("/createPost", upload.single("media"), postsController.createPost);

router.post("/likePost/:id", postsController.likePost);

router.delete("/deletePost/:id", postsController.deletePost);

export default router;
