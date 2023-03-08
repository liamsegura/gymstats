const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const prsController = require("../controllers/prs");
const { ensureAuth, ensureGuest } = require("../middleware/auth");


//Pr Routes - simplified for now

router.post("/createPR", upload.single("media"), prsController.createPR);

router.put("/likePR/:id", prsController.likePR);

router.delete("/deletePR/:id", prsController.deletePR);

module.exports = router;
