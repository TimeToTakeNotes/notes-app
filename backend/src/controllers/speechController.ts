import { Request, Response, NextFunction } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { transcribeAudio } from "../utils/whisper"; // Helper for Whisper logic
import { extname } from "path";  // To check and handle file extensions

// Multer setup for audio file uploads
const upload = multer({ dest: "uploads/" });

// Middleware function for handling file upload
export const uploadAudioMiddleware = upload.single("audio");

// Route handler for processing the audio and transcribing it
export const uploadAudio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No audio file uploaded" }); // Send response, no return needed
      return;
    }

    let audioFilePath = path.resolve(req.file.path);

    // Check the MIME type and handle extensions accordingly
    const mimeType = req.file.mimetype.toLowerCase();
    let ext = extname(req.file.originalname).toLowerCase();

    if (!ext) {
      // If no extension found, determine it based on MIME type
      switch (mimeType) {
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

    // Rename the file with the correct extension
    const updatedFilePath = audioFilePath + ext;

    // Rename the file on the filesystem
    fs.renameSync(audioFilePath, updatedFilePath);

    // Transcribe the audio file using Whisper
    const transcription = await transcribeAudio(updatedFilePath);

    // Clean up uploaded file
    fs.unlinkSync(updatedFilePath);

    res.json({ transcription }); // Send response, no return needed
  } catch (error) {
    console.error("Error processing audio:", error);
    res.status(500).json({ error: "Failed to process audio" }); // Send response, no return needed
  }
};
