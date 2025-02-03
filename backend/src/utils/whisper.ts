import { spawn } from "child_process";
import path from "path";

// Use __dirname to get the absolute path of the current file and resolve the script path accordingly
export const transcribeAudio = (audioFilePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      path.resolve("../src/scripts/python_scripts/whisper_script.py"), // Adjust the path to your Whisper Python script
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
        console.log("Transcription result: ", transcription.trim()); // Log the transcription result
        resolve(transcription.trim());
      } else {
        reject(errorOutput || "Unknown error occurred during transcription.");
      }
    });
  });
};

