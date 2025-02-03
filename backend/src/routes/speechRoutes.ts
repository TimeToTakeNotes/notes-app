import express from "express";
import { uploadAudio, uploadAudioMiddleware } from "../controllers/speechController";

const router = express.Router();

router.post("/", uploadAudioMiddleware, uploadAudio);

export default router;
