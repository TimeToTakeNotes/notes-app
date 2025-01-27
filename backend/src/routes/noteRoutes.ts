import { Router } from "express";
import prisma from "../db"; // Use the Prisma Client instance

const router = Router();

router.get("/", async (req, res) => {
    const notes = await prisma.note.findMany();
    res.json(notes);
});

export default router;