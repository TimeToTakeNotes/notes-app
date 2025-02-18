import React from 'react';
import { Note } from '../../types/notes';
import './NotesList.css';

type NotesListProps = {
  notes: Note[];
  onSelectNote: (note: Note) => void;
};

const NotesList: React.FC<NotesListProps> = ({ notes, onSelectNote }) => {
  return (
    <ul className="notes-list">
      {notes.map((note) => (
        <li key={note.id} onClick={() => onSelectNote(note)}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </li>
      ))}
    </ul>
  );
};

export default NotesList;
