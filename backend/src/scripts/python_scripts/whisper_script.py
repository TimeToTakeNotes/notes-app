import sys
import whisper

# Load Whisper model
model = whisper.load_model("base")

# Get the audio file path from the command-line arguments
audio_file = sys.argv[1]

try:
    # Transcribe the audio
    result = model.transcribe(audio_file)

    # Print the transcription (this will be sent to Node.js)
    print(result["text"])
except Exception as e:
    print(f"Error during transcription: {str(e)}")
    sys.exit(1)


