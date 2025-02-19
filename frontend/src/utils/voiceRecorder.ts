// Manages voice recording and transcription.
import { transcribeAudio } from "../services/api/speechToTextAPI";

export const startRecording = async (
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>,
  setTranscription: React.Dispatch<React.SetStateAction<string | null>>,
  setMediaRecorder: React.Dispatch<React.SetStateAction<MediaRecorder | null>>,
  setContent: React.Dispatch<React.SetStateAction<string>>
) => {
  setIsRecording(true);
  setTranscription("Recording...");
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);

  recorder.ondataavailable = async (event) => {
    const audioBlob = event.data;
    const transcriptionResult = await transcribeAudio(audioBlob);
    if (transcriptionResult) {
      setContent((prevContent) => prevContent + " " + transcriptionResult);
    }
    setTranscription(transcriptionResult ? null : "Error during transcription");
  };

  recorder.start();
  setMediaRecorder(recorder);
};

export const stopRecording = (
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>,
  setTranscription: React.Dispatch<React.SetStateAction<string | null>>,
  mediaRecorder: MediaRecorder | null,
  setMediaRecorder: React.Dispatch<React.SetStateAction<MediaRecorder | null>>
) => {
  setTranscription("Processing...");
  setIsRecording(false);
  mediaRecorder?.stop();
  setMediaRecorder(null);
};