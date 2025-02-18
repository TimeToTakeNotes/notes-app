export type Tag = {
    noteId: number;
    tagId: number;
    name: string;
  };
  
  export type Note = {
    id: number;
    title: string;
    content: string;
    category: string;
    isPinned: boolean;
    tags: Tag[];
  };
  
  export type NoteResponse = {
    id: number;
    title: string;
    content: string;
    category: string;
    isPinned: boolean;
    tags: Tag[];
  };  