import { Request, Response } from "express";
import prisma from "../db";

import { getUniqueTags, cleanupUnusedTags, handleServerError, validateId } from "../utils/tagUtils";


export const getNotes = async (req: Request, res: Response) => {
    try {
        const notes = await prisma.note.findMany({
            select: {
                id: true,
                title: true,
                content: true,
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
        const formattedNotes = notes.map(note => ({
            ...note,
            tags: note.tags.map(noteTag => ({
                noteId: noteTag.noteId,
                tagId: noteTag.tagId,
                name: noteTag.tag.name
            }))
        }));

        res.json(formattedNotes);
    } catch (error) {
        handleServerError(res, error, "Failed to fetch notes");
    }
};


export const createNote = async (req: Request, res: Response) => {
    const { title, content, tags } = req.body as { title: string; content: string; tags: string[] };

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

        // Format the response to match the GET structure
        const formattedNote = {
            id: newNote.id,
            title: newNote.title,
            content: newNote.content,
            createdAt: newNote.createdAt,
            updatedAt: newNote.updatedAt,
            tags: newNote.tags.map((noteTag) => ({
                noteId: noteTag.noteId,
                tagId: noteTag.tagId,
                name: noteTag.tag.name // Flatten the tag structure
            }))
        };

        res.status(201).json(newNote);
    } catch (error) {
        handleServerError(res, error, "Failed to create note");
    }
};


export const updateNote = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { title, content, tags } = req.body as { title: string; content: string; tags: string[] };

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

        // Format the response to match the GET structure
        const formattedNote = {
            id: updatedNote.id,
            title: updatedNote.title,
            content: updatedNote.content,
            createdAt: updatedNote.createdAt,
            updatedAt: updatedNote.updatedAt,
            tags: updatedNote.tags.map((noteTag) => ({
                noteId: noteTag.noteId,
                tagId: noteTag.tagId,
                name: noteTag.tag.name // Flatten the tag structure
            }))
        };

        // Cleanup: Delete tags no longer associated with any notes
        await cleanupUnusedTags();

        res.status(200).json(updatedNote);
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