import express from "express";
import cors from "cors";
import noteRoutes from "./routes/noteRoutes"; // Import routes

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/notes", noteRoutes); // Use the route

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));