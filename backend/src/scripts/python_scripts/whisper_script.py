import sys
import whisper
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

# Load Whisper model
model = whisper.load_model("base")

def transcribe_audio(file_path):
    # Transcribe the given audio file
    result = model.transcribe(file_path)
    print(result["text"])  # Send transcription result to stdout

if __name__ == "__main__":
    audio_file = sys.argv[1]
    transcribe_audio(audio_file)


