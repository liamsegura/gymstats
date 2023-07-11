import express from "express"
const router = express.Router();
import commentsController from "../controllers/comments"


router.post("/createComment/:id", commentsController.createComment);

// router.put("/likeComment/:id", commentController.likeComment);

router.delete("/deleteComment/:id", commentsController.deleteComment);

router.delete("/deleteReply/:id", commentsController.deleteReply);

export default router;
