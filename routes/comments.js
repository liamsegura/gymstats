const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");


router.post("/createComment/:id", commentsController.createComment);

// router.put("/likeComment/:id", commentController.likeComment);

router.delete("/deleteComment/:id", commentsController.deleteComment);

router.delete("/deleteReply/:id", commentsController.deleteReply);

module.exports = router;
