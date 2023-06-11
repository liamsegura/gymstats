const express = require("express");
const router = express.Router();
const challengesController = require("../controllers/challenges");
const { ensureAuth, ensureGuest } = require("../middleware/auth");
const upload = require("../middleware/multer");



router.get("/", challengesController.getChallenges);

router.get("/:id", challengesController.getChallenge);

router.get("/submission/:id", challengesController.getSubmission);

router.post("/createChallenge", challengesController.createChallenge);

router.post("/:id/join", challengesController.joinChallenge);

router.post("/:id/submit", upload.single("media"), challengesController.submitChallenge);

router.delete("/deleteChallenge/:id", challengesController.deleteChallenge);

module.exports = router;
