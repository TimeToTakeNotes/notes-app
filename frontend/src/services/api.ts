export const fetchNotes = async () => {
    const response = await fetch("http://localhost:5000/api/notes");
    return response.json();
  };
  
  export const addNote = async (noteData: object) => {
    const response = await fetch("http://localhost:5000/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(noteData)
    });
    return response.json();
  };
  