const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");


//Post Routes - simplified for now
router.get("/:id", ensureAuth, postsController.getPost);

router.get("/:id/likes", ensureAuth, postsController.getLikes);

router.post("/createPost", upload.single("media"), postsController.createPost);

router.post("/createPost", upload.single("media"), postsController.createPost);

router.post("/likePost/:id", postsController.likePost);

router.delete("/deletePost/:id", postsController.deletePost);

module.exports = router;
