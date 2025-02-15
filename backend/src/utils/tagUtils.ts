import { Response } from "express";
import prisma from "../db";


export const getUniqueTags = (tags: string[]): string[] => {
    return Array.isArray(tags)
        ? tags.filter((tag) => typeof tag === "string" && tag.length > 0)
        : [];
};


export const cleanupUnusedTags = async () => {
    await prisma.tag.deleteMany({
        where: {
            notes: {
                none: {}  // No notes are linked to this tag
            }
        }
    });
};


export const handleServerError = (res: Response, error: unknown, message: string) => {
    console.error(error);
    res.status(500).json({ error: message });
};


export const validateId = (id: number, res: Response): boolean => {
    if (!id || isNaN(id)) {
        res.status(400).json({ error: "ID is required and must be a valid number" });
        return false;
    }
    return true;
};