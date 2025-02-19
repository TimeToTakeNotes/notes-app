import {useEffect, useState, useRef} from 'react';

// Import hooks
import useFetchNotes from './hooks/useFetchNotes';
import useOutsideClick from './hooks/useOutsideClick';
import useHeaderHeight from './hooks/useHeaderHeight';

// Import types
import { Note } from "./types/noteTypes";

// Import utils
import { filterAndSortNotes } from './utils/filterNotes';
import { highlightText } from "./utils/highlight";
import { handleAddNote, handleUpdateNote, handleDeleteNote, handleTogglePin } from "./utils/noteHandlers";
import { toggleSidebar, handleCategoryClick, burgerMouseEnter, burgerMouseLeave } from "./utils/sidebar";
import { addTag, removeTag } from "./utils/tags";
import { startRecording, stopRecording } from "./utils/voiceRecorder";


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

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording(setIsRecording, setTranscription, mediaRecorder, setMediaRecorder);
    } else {
      startRecording(setIsRecording, setTranscription, setMediaRecorder, setContent);
    }
  };
  

  return( <>
    <div ref={headerRef} className='top-header'>
      <button 
        ref={burgerRef}
        className='burger-menu' 
        type='button'
        onClick={(e) => {
          e.stopPropagation(); // Prevent event from reaching document listener to prevent sidebar open/close glitch
          toggleSidebar(isSidebarOpen, setIsSidebarOpen);
        }}
        onMouseEnter={() => burgerMouseEnter(setIsHovered)}
        onMouseLeave={() => burgerMouseLeave(setIsHovered)}>
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
          onClick={() => handleCategoryClick("", setSelectedCategory, setIsSidebarOpen)}>
          All Notes
        </li>
        <li 
          className={selectedCategory === "GENERAL" ? "active" : ""}
          onClick={() => handleCategoryClick("GENERAL", setSelectedCategory, setIsSidebarOpen)}>
          GENERAL
        </li>
        <li 
          className={selectedCategory === "WORK" ? "active" : ""}
          onClick={() => handleCategoryClick("WORK", setSelectedCategory, setIsSidebarOpen)}>
          WORK
        </li>
        <li 
          className={selectedCategory === "PERSONAL" ? "active" : ""}
          onClick={() => handleCategoryClick("PERSONAL", setSelectedCategory, setIsSidebarOpen)}>
          PERSONAL
        </li>
        <li 
          className={selectedCategory === "OTHER" ? "active" : ""}
          onClick={() => handleCategoryClick("OTHER", setSelectedCategory, setIsSidebarOpen)}>
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
              selectedNote
              ? handleUpdateNote(
                event,
                { title, content, category, tags }, // FormState
                { setTitle, setContent, setCategory, setTags }, // FormSetters
                { notes, setNotes }, // NoteState
                { setIsFormVisible }, // FormVisibility
                { selectedNote, setSelectedNote } // SelectedNote
              )
            : handleAddNote(
                event,
                { title, content, category, tags }, // FormState
                { setTitle, setContent, setCategory, setTags }, // FormSetters
                { notes, setNotes }, // NoteState
                { setIsFormVisible } // FormVisibility
              )}>
                  
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
                onClick={handleMicClick}
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
                    onClick={() => removeTag(index, tags, setTags)}
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
              onKeyDown={(event) => addTag(event, tagInput, tags, setTags, setTagInput)}
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
                    handleTogglePin(note.id, { notes, setNotes });
                  }}>
                  <FontAwesomeIcon icon={note.isPinned ? faSolidStar : faRegularStar}/></button>
                <button className='delete-note' onClick={(event) => handleDeleteNote(event, note.id, { notes, setNotes })}>X</button>
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