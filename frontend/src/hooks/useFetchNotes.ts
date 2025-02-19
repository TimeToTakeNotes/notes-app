//Custom hook to fetch notes from the API and manage state.
// Retrieves notes from the backend, formats them, and stores them in state.
// Runs once on component mount.

import { useEffect, useState } from 'react';
import { Note } from '../types/noteTypes';
import { fetchNotes } from '../services/api/notesAPI';


const useFetchNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const getNotes = async () => {
      const notesData: Note[] = await fetchNotes(); // Use API function

      // Ensure proper tag structure
      const formattedNotes: Note[] = notesData.map((note) => ({
        ...note,
        updatedAt: note.updatedAt,
        tags: note.tags
          ? note.tags.map((tag) => ({
              noteId: tag.noteId,
              tagId: tag.tagId,
              name: tag.name,
            }))
          : [], // Fallback to an empty array
      }));

      setNotes(formattedNotes);
    };

    getNotes();
  }, []);

  return { notes, setNotes };
};

export default useFetchNotes;
