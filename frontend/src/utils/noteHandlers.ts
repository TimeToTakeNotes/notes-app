// Handles CRUD operations for notes, including adding, updating, deleting, and toggling pinned status.
import { Note } from "../types/noteTypes";
import { addNote, updateNote, deleteNote, togglePin } from "../services/api/notesAPI";

interface FormState {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface FormSetters {
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

interface NoteState {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

interface FormVisibility {
  setIsFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SelectedNote {
  selectedNote: Note | null;
  setSelectedNote: React.Dispatch<React.SetStateAction<Note | null>>;
}


export const handleAddNote = async (
  event: React.FormEvent,
  formState: FormState,
  formSetters: FormSetters,
  noteState: NoteState,
  formVisibility: FormVisibility
) => {
  event.preventDefault();
  try {
    const newNote = await addNote(
      formState.title,
      formState.content,
      formState.category,
      formState.tags
    );
    if (newNote) {
      noteState.setNotes([newNote, ...noteState.notes]);
      formSetters.setTitle("");
      formSetters.setContent("");
      formSetters.setCategory("");
      formSetters.setTags([]);
      formVisibility.setIsFormVisible(false);
    }
  } catch (e) {
    console.log(e);
  }
};

export const handleUpdateNote = async (
  event: React.FormEvent,
  formState: FormState,
  formSetters: FormSetters,
  noteState: NoteState,
  formVisibility: FormVisibility,
  selectedNote: SelectedNote
) => {
  event.preventDefault();

  if (!selectedNote.selectedNote) {
    return;
  }

  try {
    const updatedNote = await updateNote(
      selectedNote.selectedNote.id,
      formState.title,
      formState.content,
      formState.category,
      formState.tags,
      selectedNote.selectedNote.isPinned
    );

    const updatedNotesList = noteState.notes.map((note) =>
      note.id === selectedNote.selectedNote?.id ? updatedNote : note
    );

    noteState.setNotes(updatedNotesList);
    formSetters.setTitle("");
    formSetters.setContent("");
    formSetters.setCategory("");
    formSetters.setTags([]);
    selectedNote.setSelectedNote(null);
    formVisibility.setIsFormVisible(false);
  } catch (e) {
    console.log(e);
  }
};

export const handleDeleteNote = async (
  event: React.MouseEvent,
  noteId: number,
  noteState: NoteState
) => {
  event.stopPropagation();

  try {
    await deleteNote(noteId);

    const updatedNotes = noteState.notes.filter((note) => note.id !== noteId);
    noteState.setNotes(updatedNotes);
  } catch (e) {
    console.log(e);
  }
};

export const handleTogglePin = async (
  noteId: number,
  noteState: NoteState
) => {
  const noteToToggle = noteState.notes.find((note) => note.id === noteId);

  if (!noteToToggle) return;

  const updatedNote = { ...noteToToggle, isPinned: !noteToToggle.isPinned };

  try {
    await togglePin(noteId, updatedNote.isPinned);

    const updatedNotesList = noteState.notes.map((note) =>
      note.id === noteId ? updatedNote : note
    );

    noteState.setNotes(updatedNotesList);
  } catch (e) {
    console.log(e);
  }
};