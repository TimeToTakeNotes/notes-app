import { Request, Response } from "express";
import prisma from "../db";

import { getUniqueTags, cleanupUnusedTags, handleServerError, validateId } from "../utils/tagUtils";


// Interfaces for type safety
interface NoteRequest {
    title: string;
    content: string;
    isPinned: boolean;
    tags: string[];
}

interface FormattedNote {
    id: number;
    title: string;
    content: string;
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
    tags: {
        noteId: number;
        tagId: number;
        name: string;
    }[];
}


// Helper to format note
const formatNote = (note: any): FormattedNote => ({
    ...note,
    tags: note.tags.map((noteTag: any) => ({
        noteId: noteTag.noteId,
        tagId: noteTag.tagId,
        name: noteTag.tag.name
    }))
});



export const getNotes = async (req: Request, res: Response) => {
    try {
        const notes = await prisma.note.findMany({
            select: {
                id: true,
                title: true,
                content: true,
                isPinned: true,
                createdAt: true,
                updatedAt: true,
                tags: {
                    select: {
                        noteId: true,
                        tagId: true,
                        tag: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Flatten tags to the expected format
        const formattedNotes = notes.map(formatNote);

        res.json(formattedNotes);
    } catch (error) {
        handleServerError(res, error, "Failed to fetch notes");
    }
};


export const createNote = async (req: Request, res: Response) => {
    const { title, content, tags, isPinned } = req.body as NoteRequest;

    if (!title || !content) {
        res.status(400).json({ error: "Title and content are required" });
        return;
    }

    try {
        const uniqueTags = getUniqueTags(tags);

        const newNote = await prisma.note.create({
            data: {
                title,
                content,
                isPinned: isPinned || false,
                tags: {
                    create: uniqueTags.map((tagName) => ({
                        tag: {
                            connectOrCreate: {
                                where: { name: tagName },
                                create: { name: tagName }
                            }
                        }
                    }))
                }
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        res.status(201).json(formatNote(newNote));
    } catch (error) {
        handleServerError(res, error, "Failed to create note");
    }
};


export const updateNote = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { title, content, tags, isPinned } = req.body as NoteRequest;

    if (!validateId(id, res)) return;

    if (!title || !content) {
        res.status(400).json({ error: "Title and content are required" });
        return;
    }

    try {
        const uniqueTags = getUniqueTags(tags);

        // Disconnect all current tags
        await prisma.noteTag.deleteMany({
            where: { noteId: id }
        });

        // Reconnect or create new tags
        const updatedNote = await prisma.note.update({
            where: { id },
            data: {
                title,
                content,
                isPinned: isPinned !== undefined ? isPinned : false,
                tags: {
                    create: uniqueTags.map((tagName) => ({
                        tag: {
                            connectOrCreate: {
                                where: { name: tagName },
                                create: { name: tagName }
                            }
                        }
                    }))
                }
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        // Cleanup: Delete tags no longer associated with any notes
        await cleanupUnusedTags();

        res.status(200).json(formatNote(updatedNote));
    } catch (error) {
        handleServerError(res, error, "Failed to update note");
    }
};


export const deleteNote = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!validateId(id, res)) return;

    try {
        // Disconnect all tags first
        await prisma.noteTag.deleteMany({
            where: { noteId: id }
        });

        // Then delete the note
        await prisma.note.delete({
            where: { id }
        });

        // Cleanup: Delete tags no longer associated with any notes
        await cleanupUnusedTags();

        res.status(204).send();
    } catch (error) {
        handleServerError(res, error, "Failed to delete note");
    }
};


export const updatePin = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const isPinned = req.body.isPinned === true || req.body.isPinned === 'true';
    

    if (isNaN(id)) {
        res.status(400).json({ error: "Invalid note ID" });
        return;
    }    

    try {
        console.log("Updating note:", { id, isPinned });

        const note = await prisma.note.findUnique({ where: { id } });
        if (!note) {
            res.status(404).json({ error: "Note not found" });
            return;
        }

        const updatedNote = await prisma.note.update({
            where: { id },
            data: { isPinned },
        });

        res.status(200).json(formatNote(updatedNote));
    } catch (error) {
        handleServerError(res, error, "Failed to update pinned status");
    }
};