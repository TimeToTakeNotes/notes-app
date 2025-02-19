const BASE_URL = "http://localhost:5000/api/notes";

export const fetchNotes = async () => {
    try {
      const response = await fetch(BASE_URL);
      return response.json();
    } catch (error) {
      console.error("Error fetching notes:", error);
      return [];
    }
};

export const addNote = async (title: string, content: string, category: string, tags: string[]) => {
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, isPinned: false, tags }),
      });
  
      return response.json();
    } catch (error) {
      console.error("Error adding note:", error);
    }
};
  
export const updateNote = async (noteId: number, title: string, content: string, category: string, tags: string[], isPinned: boolean) => {
    try {
      const response = await fetch(`${BASE_URL}/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, tags, isPinned }),
      });
  
      return response.json();
    } catch (error) {
      console.error("Error updating note:", error);
    }
};
  
export const deleteNote = async (noteId: number) => {
    try {
      await fetch(`${BASE_URL}/${noteId}`, { method: "DELETE" });
    } catch (error) {
      console.error("Error deleting note:", error);
    }
};
  
export const togglePin = async (noteId: number, isPinned: boolean) => {
    try {
      await fetch(`${BASE_URL}/${noteId}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned }),
      });
    } catch (error) {
      console.error("Error pinning note:", error);
    }
};