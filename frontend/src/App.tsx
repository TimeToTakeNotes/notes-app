import React, {useEffect, useState, useRef} from 'react';

import useFetchNotes from './hooks/useFetchNotes';

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
  category: string;
  isPinned: boolean;
  tags: { noteId: number; tagId: number; name: string }[];
  
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
  category: string;
  isPinned: boolean;
  tags: { noteId: number; tagId: number; name: string }[];
  
};


const App = () => {
  const { notes, setNotes } = useFetchNotes();


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

  const [ category, setCategory ] = useState("");

  const [ selectedCategory, setSelectedCategory ] = useState("");
  const [ isSidebarOpen, setIsSidebarOpen ] = useState(false);


  const burgerRef = useRef<HTMLButtonElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);


  useEffect(() => {
    document.title = "Notes App";
  }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        burgerRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !burgerRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
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
            category,
            isPinned: false,
            tags,  
          })
        }
      );

      const newNote = await response.json();

      // Normalize the tags structure to match the GET response
      const formattedNote: Note = {
        id: newNote.id,
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        isPinned: newNote.isPinned,
        tags: newNote.tags.map((noteTag: any) => ({
          noteId: noteTag.noteId,
          tagId: noteTag.tagId,
          name: noteTag.tag.name
        }))
      };

      setNotes([formattedNote, ...notes]);
      setTitle("");
      setContent("");
      setCategory("");
      setTags([]);
      setIsFormVisible(false);
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
          category,
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
        category: updatedNote.category,
        isPinned: updatedNote.isPinned,
        tags: updatedNote.tags.map((noteTag: any) => ({
          noteId: noteTag.noteId,
          tagId: noteTag.tagId,
          name: noteTag.tag.name // Extract the name from the nested tag object in the JSON response
        }))
      };

      const updatedNotesList = notes.map((note) =>
        note.id === selectedNote.id ? formattedNote : note
      );

      setNotes(updatedNotesList);
      setTitle("");
      setContent("");
      setCategory("");
      setTags([]);
      setSelectedNote(null);
      setIsFormVisible(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCancel = () => {
    setTitle("")
    setContent("")
    setCategory("");
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
      (selectedCategory === "" || note.category === selectedCategory) && 
      (note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setIsSidebarOpen(false);
  };

  

  return( <>
    <div ref={headerRef} className='top-header'>
      <button 
        ref={burgerRef}
        className='burger-menu' 
        type='button'
        onClick={(e) => {
          e.stopPropagation(); // Prevent event from reaching document listener to prevent sidebar open/close glitch
          toggleSidebar();
        }}
        onMouseEnter={burgerMouseEnter}
        onMouseLeave={burgerMouseLeave}>
        <FontAwesomeIcon 
          icon={isHovered || isSidebarOpen ? faArrowRight : faBars} 
          className={`arrow-icon ${isSidebarOpen ? 'rotate' : ''}`}
        />
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

    <div ref={sidebarRef} className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <ul className="category-list">
        <li 
          className={selectedCategory === "" ? "active" : ""}
          onClick={() => handleCategoryClick("")}>
          All Notes
        </li>
        <li 
          className={selectedCategory === "GENERAL" ? "active" : ""}
          onClick={() => handleCategoryClick("GENERAL")}>
          GENERAL
        </li>
        <li 
          className={selectedCategory === "WORK" ? "active" : ""}
          onClick={() => handleCategoryClick("WORK")}>
          WORK
        </li>
        <li 
          className={selectedCategory === "PERSONAL" ? "active" : ""}
          onClick={() => handleCategoryClick("PERSONAL")}>
          PERSONAL
        </li>
        <li 
          className={selectedCategory === "OTHER" ? "active" : ""}
          onClick={() => handleCategoryClick("OTHER")}>
          OTHER
        </li>
      </ul>
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

            <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-dropdown">
                <option value="">Select Category</option>
                <option value="GENERAL">GENERAL</option>
                <option value="WORK">WORK</option>
                <option value="PERSONAL">PERSONAL</option>
                <option value="OTHER">OTHER</option>
              </select>

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