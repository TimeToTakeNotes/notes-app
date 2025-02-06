import { Request, Response, NextFunction } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { transcribeAudio } from "../utils/whisper"; // Helper for Whisper logic
import { extname } from "path";  // To check and handle file extensions

// Multer setup for audio file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["audio/mp3", "audio/wav", "audio/ogg", "audio/webm"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
});

// Middleware function for handling file upload
export const uploadAudioMiddleware = upload.single("audio");

// Route handler for processing the audio and transcribing it
export const uploadAudio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No audio file uploaded" });
      return;
    }

    let audioFilePath = path.resolve(req.file.path);

    // Check and handle extensions
    const mimeType = req.file.mimetype.toLowerCase();
    let ext = extname(req.file.originalname).toLowerCase();

    if (!ext) {
      switch (mimeType) {
        case "audio/webm":
          ext = ".webm";
          break;
        case 'audio/mp3':
          ext = '.mp3';
          break;
        case 'audio/wav':
          ext = '.wav';
          break;
        case 'audio/ogg':
          ext = '.ogg';
          break;
        default:
          res.status(400).json({ error: "Unsupported file type" });
          return;
      }
    }

    // Rename file with correct extension
    const updatedFilePath = audioFilePath + ext;
    fs.renameSync(audioFilePath, updatedFilePath);

    // Get transcription result
    const transcription = await transcribeAudio(updatedFilePath);

    // Clean up uploaded file
    fs.unlinkSync(updatedFilePath);

    // Send clean transcription result to frontend
    res.json({ transcription });
  } catch (error) {
    console.error("Error processing audio:", error);
    res.status(500).json({ error: "Failed to process audio" });
  }
};