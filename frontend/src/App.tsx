import React, {useEffect, useState, useRef} from 'react';

import useFetchNotes from './hooks/useFetchNotes';
import useOutsideClick from './hooks/useOutsideClick';
import useHeaderHeight from './hooks/useHeaderHeight';

import { Note } from "./types/noteTypes";

import { addNote, updateNote, deleteNote, togglePin } from "./services/api/notesAPI";
import { transcribeAudio } from './services/api/speechToTextAPI';

import { filterAndSortNotes } from './utils/filterNotes';

import { highlightText } from "./utils/highlight";

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faNotesMedical, faBars, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';

import "./App.css";


// Add the FontAwesom icons to the library
library.add(faMicrophone, faNotesMedical, faBars, faArrowRight, faArrowLeft, faSolidStar, faRegularStar);


const App = () => {
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


  // Use hooks
  const { notes, setNotes } = useFetchNotes();

  const burgerRef = useRef<HTMLButtonElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick([sidebarRef, burgerRef], () => setIsSidebarOpen(false));

  const headerRef = useRef<HTMLDivElement>(null);
  useHeaderHeight(headerRef);

  // Use utils
  const filteredNotes = filterAndSortNotes(notes, selectedCategory, searchQuery);


  // Update document title
  useEffect(() => {
    document.title = "Notes App";
  }, []);


  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const newNote = await addNote(
        title,
        content,
        category,
        tags
      );

      if (newNote) {
        setNotes([newNote, ...notes]);
        setTitle("");
        setContent("");
        setCategory("");
        setTags([]);
        setIsFormVisible(false);
      }
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
      const updatedNote = await updateNote(
        selectedNote.id,
        title,
        content,
        category,
        tags,
        selectedNote.isPinned
      );

      const updatedNotesList = notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
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


  const handleDeleteNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation();

    try {
      await deleteNote(noteId);

      const updatedNotes = notes.filter((note) => note.id !== noteId);

      setNotes(updatedNotes);
    } catch (e) {
      console.log(e);
    }
  };


  const handleTogglePin = async (noteId: number) => {
    const noteToToggle = notes.find((note) => note.id === noteId);
  
    if (!noteToToggle) return;
  
    const updatedNote = {
      ...noteToToggle,
      isPinned: !noteToToggle.isPinned
    };
  
    try {
      await togglePin(
        noteId,
        updatedNote.isPinned
      );
  
      const updatedNotesList = notes.map((note) =>
        note.id === noteId ? updatedNote : note
      );
  
      setNotes(updatedNotesList);
    } catch (e) {
      console.log(e);
    }
  };


  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setTags(note.tags.map((tag) => tag.name)) // Load tags correctly
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setTitle("")
    setContent("")
    setCategory("");
    setTags([]);
    setSelectedNote(null);
    setIsFormVisible(false);
  };


  const startRecording = async () => {
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


  const stopRecording = () => {
    setTranscription("Processing...");
    setIsRecording(false);
    mediaRecorder?.stop();
    setMediaRecorder(null);
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
            icon={faBars} 
            className={`icon bars-icon ${isHovered || isSidebarOpen ? 'fade-out' : 'fade-in'}`}
          />
          <FontAwesomeIcon 
            icon={faArrowRight} 
            className={`icon arrow-icon ${isHovered || isSidebarOpen ? 'fade-in' : 'fade-out'} 
              ${isSidebarOpen ? 'rotate' : ''}`}
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

            <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-dropdown" required>
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
                    handleTogglePin(note.id);
                  }}>
                  <FontAwesomeIcon icon={note.isPinned ? faSolidStar : faRegularStar}/></button>
                <button className='delete-note' onClick={(event) => handleDeleteNote(event, note.id)}>X</button>
              </div>
              
            </div>
            <h2>
              {highlightText(note.title, searchQuery)}
            </h2>
            <p className='note-content'>
              {highlightText(note.content, searchQuery)}
            </p>
            <div className="note-footer">
              <span>Last Updated: {new Date(note.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>)
};

export default App;