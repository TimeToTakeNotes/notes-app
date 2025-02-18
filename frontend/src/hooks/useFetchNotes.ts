import { useEffect, useState } from 'react';
import { Note, NoteResponse } from '../types/notes';

const useFetchNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notes");
        const notesData: NoteResponse[] = await response.json();
        const formattedNotes: Note[] = notesData.map(note => ({
          ...note,
          tags: note.tags.map(tag => ({
            noteId: tag.noteId,
            tagId: tag.tagId,
            name: tag.name
          }))
        }));
        setNotes(formattedNotes);
      } catch (e) {
        console.log(e);
      }
    };
    fetchNotes();
  }, []);

  return { notes, setNotes };
};

export default useFetchNotes;
