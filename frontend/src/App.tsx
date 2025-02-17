import React, {useEffect, useState} from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faNotesMedical, faBars, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import "./App.css";


// Add the FontAwesom icons to the library
library.add(faMicrophone, faNotesMedical, faBars, faArrowRight, faArrowLeft, faSolidStar, faRegularStar);


// Type for response structure from backend
type NoteResponse = {
  id: number;
  title: string;
  content: string;
  tags: { noteId: number; tagId: number; name: string }[];
  isPinned: boolean;
};

// Type for use by notes in frontend
type Tag = {
  noteId: number;
  tagId: number;
  name: string;
};

// Type for use by notes in frontend
type Note = {
  id: number;
  title: string;
  content: string;
  tags: { noteId: number; tagId: number; name: string }[];
  isPinned: boolean;
};


const App = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [ isRecording, setIsRecording ] = useState(false);
  const [ mediaRecorder, setMediaRecorder ] = useState<MediaRecorder | null>(null);

  const [ transcription, setTranscription ] = useState<string | null>(null);

  const [ searchQuery, setSearchQuery ] = useState("");

  const [ tags, setTags ] = useState<string[]>([]);
  const [ tagInput, setTagInput ] = useState("");

  const [ isFormVisible, setIsFormVisible ] = useState(false);

  const [ isHovered, setIsHovered ] = useState(false);


  useEffect(() => {
    document.title = "Notes App";
  }, []);


  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notes");
        const notesData: NoteResponse[] = await response.json();
        
        const formattedNotes: Note[] = notesData.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          tags: note.tags.map(tag => ({
            noteId: tag.noteId,
            tagId: tag.tagId,
            name: tag.name
          })),
          isPinned: note.isPinned
        }));
        
        setNotes(formattedNotes);
      } catch (e) {
        console.log(e);
      }
    };
  
    fetchNotes();
  }, []);


  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.map((tag) => tag.name)) // Load tags correctly
    setIsFormVisible(true);
  };


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
            tags,
            isPinned: false
          })
        }
      );

      const newNote = await response.json();

      // Normalize the tags structure to match the GET response
      const formattedNote: Note = {
        id: newNote.id,
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags.map((noteTag: any) => ({
          noteId: noteTag.noteId,
          tagId: noteTag.tagId,
          name: noteTag.tag.name
        })),
        isPinned: newNote.isPinned
      };

      setNotes([formattedNote, ...notes]);
      setTitle("");
      setContent("");
      setTags([]);
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
          tags,
          isPinned: selectedNote.isPinned
        }),
      });
  
      const updatedNote = await response.json();

      // Normalize the tags structure to match the GET response
      const formattedNote: Note = {
        id: updatedNote.id,
        title: updatedNote.title,
        content: updatedNote.content,
        tags: updatedNote.tags.map((noteTag: any) => ({
          noteId: noteTag.noteId,
          tagId: noteTag.tagId,
          name: noteTag.tag.name // Extract the name from the nested tag object in the JSON response
        })),
        isPinned: updatedNote.isPinned
      };

      const updatedNotesList = notes.map((note) =>
        note.id === selectedNote.id ? formattedNote : note
      );

      setNotes(updatedNotesList);
      setTitle("");
      setContent("");
      setTags([]);
      setSelectedNote(null);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCancel = () => {
    setTitle("")
    setContent("")
    setTags([]);
    setSelectedNote(null);
    setIsFormVisible(false);
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

  const filteredNotes = notes
  .filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) => (a.isPinned === b.isPinned) ? 0 : a.isPinned ? -1 : 1);


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

  const addTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      
      const trimmedTag = tagInput.trim();
      
      // Check for tag length and tag limit
      if (trimmedTag.length > 0 && trimmedTag.length <= 50 && tags.length < 3) {
        setTags([...tags, trimmedTag]);
        setTagInput("");
      } else if (tags.length >= 3) {
        alert("Maximum of 3 tags allowed.");
      } else if (trimmedTag.length > 50) {
        alert("Tag length cannot exceed 50 characters.");
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const burgerMouseEnter = () => {
    setIsHovered(true);
  }

  const burgerMouseLeave = () => {
    setIsHovered(false);
  }

  const togglePin = async (noteId: number) => {
    const noteToToggle = notes.find((note) => note.id === noteId);
  
    if (!noteToToggle) return;
  
    const updatedNote = {
      ...noteToToggle,
      isPinned: !noteToToggle.isPinned
    };
  
    try {
      await fetch(`http://localhost:5000/api/notes/${noteId}/pin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPinned: updatedNote.isPinned }),
      });

     
  
      const updatedNotesList = notes.map((note) =>
        note.id === noteId ? updatedNote : note
      );
  
      setNotes(updatedNotesList);
    } catch (e) {
      console.log(e);
    }
  };


  return( <>
    <div className='top-header' >
      <button className='burger-menu' 
        type='button'
        onMouseEnter={burgerMouseEnter}
        onMouseLeave={burgerMouseLeave}>
        <FontAwesomeIcon icon={isHovered ? faArrowRight : faBars}/>
      </button>
      <div className='search-bar'>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes...">
        </input>
      </div>
    </div>

    <div className="app-container">
      <div className='add-note-container'>
        {!isFormVisible && (
          <button className='add-note-button' type='button' 
            onClick={() => {
              setSelectedNote(null);
              setTitle("");
              setContent("");
              setTags([]);
              setIsFormVisible(!isFormVisible);
            }}>
            <FontAwesomeIcon icon={faNotesMedical}/>
          </button>
        )}
      

        {isFormVisible && (
          <form className="note-form visible" 
            onSubmit={(event) => 
              selectedNote ? handleUpdateNote(event) : handleAddNote(event)}>
                  
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


            <div className="tags-container">
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag} 
                  <button 
                    type="button" 
                    className="remove-tag-btn"
                    onClick={() => removeTag(index)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input 
              type="text"
              placeholder={tags.length < 3 ? "Add a tag..." : "Max 3 tags"}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              disabled={tags.length >= 3}
              className='tags-input'/>

            {selectedNote ? (
              <div className='edit-buttons'>
                <button type='submit'>Save</button>
                <button type='button' onClick={handleCancel}>Cancel</button>
              </div>
            ) : (
              <div className='edit-buttons'>
                <button type='submit'>Add Note</button>
                <button type='button' onClick={handleCancel}>Cancel</button>
              </div>
            )}
          </form>
        )}
      </div>
    

      <div className="notes-grid">
        {filteredNotes.map((note) => (
          <div className="note-item" onClick={() => handleNoteClick(note)} key={note.id}>
            <div className="notes-header">
              <div className="note-tags">
                {note.tags.map((tag, index) => (
                  <span key={index} className="note-tag">
                    #{tag.name}
                  </span>
                ))}
              </div>
              <div className='note-header-buttons'>
                <button className='pin'
                  onClick={(event) => {
                    event.stopPropagation(); // Prevents triggering onClick of the note itself
                    togglePin(note.id);
                  }}>
                  <FontAwesomeIcon icon={note.isPinned ? faSolidStar : faRegularStar}/></button>
                <button className='delete-note' onClick={(event) => deleteNote(event, note.id)}>X</button>
              </div>
              
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
    </div>
  </>)
};

export default App;