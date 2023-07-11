import express from "express"
const router = express.Router()
import upload from "../middleware/multer"
import prsController from "../controllers/prs"


//Pr Routes - simplified for now

router.post("/createPR", upload.single("media"), prsController.createPR);

router.post("/likePR/:id", prsController.likePR);

router.delete("/deletePR/:id", prsController.deletePR);

export default router;
