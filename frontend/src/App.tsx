import React, {useEffect, useState} from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';

import "./App.css";
import { text } from 'stream/consumers';

// Add the FontAwesom icons to the library
library.add(faMicrophone);

type Note = {
  id: number;
  title: string;
  content: string
};


const App = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [ isRecording, setIsRecording ] = useState(false);
  const [ mediaRecorder, setMediaRecorder ] = useState<MediaRecorder | null>(null);

  const [transcription, setTranscription] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Notes App";
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notes");

        const notes: Note[] = await response.json();

        setNotes(notes);
      } catch (e) {
        console.log(e);
      }
    };

    fetchNotes();
  }, []);


  const handleNoteClick = (note:Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  }


  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    try {

      const response = await fetch("http://localhost:5000/api/notes", 
        {
          method:"POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title,
            content,
          })
        }
      );

      const newNote = await response.json();

      setNotes([newNote, ...notes]);
      setTitle("");
      setContent("");
    } catch (e) {
      console.log(e);
    }
  };
  

  const handleUpdateNote = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!selectedNote) {
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${selectedNote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });
  
      const updatedNote = await response.json();

      const updatedNotesList = notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      );

      setNotes(updatedNotesList);
      setTitle("");
      setContent("");
      setSelectedNote(null);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCancel = () => {
    setTitle("")
    setContent("")
    setSelectedNote(null);
  };

  const deleteNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation();

    try {
      await fetch(`http://localhost:5000/api/notes/${noteId}`, 
        {
          method: "DELETE",
        }
      );

      const updatedNotes = notes.filter((note) => note.id !== noteId);

      setNotes(updatedNotes);
    } catch (e) {
      console.log(e);
    }
  };


  const startRecording = async () => {
    setIsRecording(true);
    setTranscription("Recording...");
  
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
  
    recorder.ondataavailable = async (event) => {
      const audioBlob = event.data;
  
      const formData = new FormData();
      formData.append("audio", audioBlob);
  
      try {
        // Send each audio chunk to the backend for transcription
        const response = await fetch("http://localhost:5000/api/speech-to-text", {
          method: "POST",
          body: formData,
        });
  
        const data = await response.json();
        const transcriptionResult = data.transcription || "";
  
        // Append transcription result to the content in real-time
        setContent((prevContent) => prevContent + " " + transcriptionResult);

        setTranscription(null);
      } catch (e) {
        console.log("Error transcribing audio", e);
        setTranscription("Error during transcription");
      }
    };
  
    recorder.start();
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    setTranscription("Processing...");
    setIsRecording(false);
    mediaRecorder?.stop();
    setMediaRecorder(null);
  };

  const filteredNotes = notes.filter(
    (note) => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };



  return(<div className="app-container">
    <form className="note-form" 
      onSubmit={(event) => 
        selectedNote ? handleUpdateNote(event) : handleAddNote(event)}>

      <input 
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search notes..."
        className="search-bar">
      </input>
            
      <input 
        value={title}
        onChange={(event) =>
          setTitle(event.target.value)
        }
        placeholder="Title"
        required>
      </input>

      <div className="textarea-container">
        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder="Content" 
          rows={10} 
          required>
        </textarea>
        <button className='mic-button' type='button' 
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? 'Stop recording' : 'Start voice input'}>
          <FontAwesomeIcon icon={faMicrophone}/>
        </button>

        {transcription && <p className='transcription-feedback'>{transcription}</p>}

      </div>

      

      {selectedNote ? (
        <div className='edit-buttons'>
          <button type='submit'>Save</button>
          <button type='button' onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <button type='submit'>Add Note</button>
      )}
    </form>

    <div className="notes-grid">
      {filteredNotes.map((note) => (
        <div className="note-item"
          onClick={() => handleNoteClick(note)}>
        <div className="notes-header">
          <button onClick={(event) => 
            deleteNote(event, note.id)}>
            x
          </button>
        </div>
        <h2>
          {highlightText(note.title, searchQuery)}
        </h2>
        <p className='note-content'>
          {highlightText(note.content, searchQuery)}
        </p>
      </div>
      ))}
    </div>

  </div>)
};

export default App;