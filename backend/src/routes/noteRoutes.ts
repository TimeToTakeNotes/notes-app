import { Router } from "express";
import { getNotes, createNote, updateNote, deleteNote, updatePin } from "../controllers/noteController";

const router = Router();

router.get("/", getNotes);
router.post("/", createNote);
router.patch("/:id/pin", updatePin);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;