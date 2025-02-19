// Utility function to filter and sort notes based on category and search query
import { Note } from "../types/noteTypes";

export const filterAndSortNotes = (
  notes: Note[],
  selectedCategory: string,
  searchQuery: string
): Note[] => {
  return notes
    .filter(
      (note) =>
        (selectedCategory === "" || note.category === selectedCategory) &&
        (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
};
