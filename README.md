# Notes App

A **Full Stack Notes App** built with **React**, **Node.js (Express)**, **TypeScript**, **Prisma**, and **MySQL**. 
This application allows users to create, manage, and organize notes with categories, tags, pinning, search, and even speech-to-text transcription features. 
The architecture is modular, scalable, and follows modern best practices for full stack development.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database](#database)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
  - [Backend](#backend-setup)
  - [Frontend](#frontend-setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Development & Contribution](#development--contribution)

---

## Features

- **Create, Read, Update, Delete (CRUD) Notes**
- **Categorize** notes (General, Work, Personal, Other)
- **Tagging**: Add, remove, and organize notes via tags
- **Pin Notes**: Mark notes as important
- **Search & Filter**: Search by title, content, tags, or category
- **Sidebar Navigation**: Quickly filter notes by category
- **Speech-to-Text**: Transcribe audio input into notes (integrates with Python Whisper)
- **Responsive UI**: Built with CSS for a modern, clean look
- **TypeScript**: End-to-end type safety in both frontend and backend
- **RESTful API**: Well-structured endpoints for all features

---

## Tech Stack

### Frontend

- **React** (with Hooks): For building a reactive, component-based UI
- **TypeScript**: Type-safe, maintainable codebase
- **CSS**: Custom, responsive design
- **FontAwesome**: Rich iconography for UI clarity

### Backend

- **Node.js** with **Express**: API server for handling requests
- **TypeScript**: Ensures type safety and maintainability in backend code
- **Prisma ORM**: Type-safe, high-performance database access and migrations
- **CORS**, **Multer**: For cross-origin resource sharing and file uploads
- **Python**: Used for speech-to-text integration via [OpenAI Whisper](https://github.com/openai/whisper) (run as a subprocess)

### Database

- **MySQL**: Relational database for persistent storage of notes, tags, and note-tag relationships

---

## Project Structure

```
notes-app/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── db.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── App.css
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## Setup & Installation

### Backend Setup

1. **Install dependencies:**
   ```sh
   cd backend
   npm install
   ```

2. **Configure Environment Variables:**
   - Create a `.env` file in `/backend` and add your MySQL connection string:
     ```
     DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
     ```

3. **Setup Database with Prisma:**
   ```sh
   npx prisma migrate dev --name init
   ```

4. **Run the backend server:**
   ```sh
   npm start
   ```
   - The backend API will run on [http://localhost:5000](http://localhost:5000)

5. **(Optional) Speech-to-text setup:**
   - Set up a Python virtual environment and install [OpenAI Whisper](https://github.com/openai/whisper) and required dependencies. The backend will invoke the Python script for transcription.

### Frontend Setup

1. **Install dependencies:**
   ```sh
   cd frontend
   npm install
   ```

2. **Run the React development server:**
   ```sh
   npm start
   ```
   - The app will run on [http://localhost:3000](http://localhost:3000)

3. **Note:** The frontend expects the backend to be running at `localhost:5000`. You may need to adjust proxy settings as needed.

---

## Usage

- **Add a Note**: Fill out the form and click "Add". Use tags and categories to organize notes.
- **Edit/Delete/Pin**: Click on a note to edit, delete, or toggle pin status.
- **Search**: Use the search bar to filter notes.
- **Sidebar**: Filter notes by categories.
- **Speech-to-Text**: Use the microphone icon to dictate notes (requires Python Whisper setup).

---

## API Endpoints

| Method | Endpoint                | Description                         |
|--------|-------------------------|-------------------------------------|
| GET    | `/api/notes`            | Fetch all notes                     |
| POST   | `/api/notes`            | Create a new note                   |
| PUT    | `/api/notes/:id`        | Update a note                       |
| DELETE | `/api/notes/:id`        | Delete a note                       |
| PATCH  | `/api/notes/:id/pin`    | Pin or unpin a note                 |
| POST   | `/api/speech-to-text`   | Upload audio for transcription      |


Refer to the backend source for detailed request/response shapes.

---

## Development & Contribution

1. Fork the repo and create your feature branch (`git checkout -b feature/fooBar`)
2. Commit your changes (`git commit -am 'Add some feature'`)
3. Push to the branch (`git push origin feature/fooBar`)
4. Open a Pull Request

**Code Style:** Please use TypeScript and follow existing conventions.

---

## Acknowledgments

- [OpenAI Whisper](https://github.com/openai/whisper) for speech-to-text technology
- [Prisma](https://www.prisma.io/)
- [React](https://react.dev/)
- [FontAwesome](https://fontawesome.com/)
