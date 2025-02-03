import express from "express";
import cors from "cors";
import noteRoutes from "./routes/noteRoutes";
import speechRoutes from "./routes/speechRoutes";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/notes", noteRoutes);
app.use("/api/speech-to-text", speechRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));