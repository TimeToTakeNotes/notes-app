import { Request, Response } from "express";
import prisma from "../db";

export const getNotes = async (req: Request, res: Response) => {
    try {
        const notes = await prisma.note.findMany();
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notes" });
    }
};

export const createNote = async (req: Request, res: Response) => {
    const { title, content } = req.body;

    if (!title || !content) {
        res.status(400).json({ error: "Title and content are required" });
        return;
    }

    try {
        const newNote = await prisma.note.create({
            data: { title, content },
        });
        res.status(201).json(newNote); // Send back the created note
    } catch (error) {
        res.status(500).json({ error: "Failed to create note" });
    }
};

export const updateNote = async (req: Request, res: Response) => {
    const id  = parseInt(req.params.id);
    const { title, content } = req.body;

    if (!id || isNaN(id)) {
        res.status(400).json({ error: "ID is required and must be valid number"})
        return;
    }

    if (!title || !content) {
        res.status(400).json({ error: "Title and content are required" });
        return;
    }

    try {
        const updatedNote = await prisma.note.update({
            where: { id },
            data: { title, content },
        });
        res.status(200).json(updateNote);
    } catch (error) {
        res.status(500).json({ error: "Failed to update note" });
    }
};

export const deleteNote = async (req: Request, res: Response) => {
    const id  = parseInt(req.params.id);

    if (!id || isNaN(id)) {
        res.status(400).json({ error: "ID is required and must be valid number"})
        return;
    }

    try {
        const deleteNote = await prisma.note.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete note" });
    }
};