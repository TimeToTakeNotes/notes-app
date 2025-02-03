import React, {useEffect, useState} from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';

import "./App.css";
import { constants } from 'buffer';

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

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = async (event) => {
      const audioBlob = event.data;

      // Send audio blob to backed for transciption
      const formData = new FormData();
      formData.append("audio", audioBlob);

      try {
        const response = await fetch("http://localhost:5000/api/speech-to-text", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        setContent((prevContent) => prevContent + " " + data.transciption);

      } catch (e) {
        console.log("Error transcribing audio", e);
      }
    };

    recorder.start();
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorder?.stop();
  };




  return(<div className="app-container">
    <form className="note-form" 
      onSubmit={(event) => 
        selectedNote 
          ? handleUpdateNote(event)
          : handleAddNote(event)}>
            
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
        <button className='mic-button' type='button' onClick={isRecording ? stopRecording : startRecording}>
          <FontAwesomeIcon icon={faMicrophone}/>
        </button>
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
      {notes.map((note) => (
        <div className="note-item"
          onClick={() => handleNoteClick(note)}>
        <div className="notes-header">
          <button onClick={(event) => 
            deleteNote(event, note.id)}>
            x
          </button>
        </div>
        <h2>{note.title}</h2>
        <p>{note.content}</p>
      </div>
      ))}
    </div>

  </div>)
};

export default App;