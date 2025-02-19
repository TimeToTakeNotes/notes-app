const BASE_URL = "http://localhost:5000/api/speech-to-text";

export const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
  
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      return data.transcription || "";
    } catch (error) {
      console.error("Error transcribing audio", error);
      return null;
    }
};
  