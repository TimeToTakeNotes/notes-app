export type Note = {
    id: number;
    title: string;
    content: string;
    category: string;
    isPinned: boolean;
    updatedAt: string;
    tags: { noteId: number; tagId: number; name: string }[];
    
};