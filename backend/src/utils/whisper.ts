import { spawn } from "child_process";
import path from "path";


export const transcribeAudio = (audioFilePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(path.resolve("venv/Scripts/python.exe"), [
      path.resolve("src/scripts/python_scripts/whisper_script.py"),
      audioFilePath,
    ]);

    let transcription = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      transcription += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        // Remove any unwanted text that may be part of the transcription result
        transcription = transcription.trim();
        
        resolve(transcription); // Send the cleaned transcription result
      } else {
        console.error("Whisper error output:", errorOutput);
        reject(errorOutput || "Unknown error occurred during transcription.");
      }
    });
  });
};


