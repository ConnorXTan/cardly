# Cardly 🪪

A modern digital business card generator with a conversational prompt flow, live preview, and user authentication.

## What it does

Cardly walks you through a step-by-step prompt to collect your professional details, shows a live preview of your card as you type, and saves everything to your account after login.

## Features

- 6-step conversational prompt flow
- Live business card preview that updates as you type
- User registration and login with JWT authentication
- Passwords hashed with bcrypt
- SQLite database for storing users and cards
- Clean dark UI built with React

## Tech Stack

**Frontend**
- React.js
- React Router
- Axios

**Backend**
- Node.js + Express
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- bcryptjs

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/ConnorXTan/cardly.git
cd cardly
```

### 2. Start the backend
```bash
npm install
node server.js
```
Backend runs on http://localhost:3000

### 3. Start the frontend
```bash
cd cardly-frontend
npm install
npm start
```
Frontend runs on http://localhost:3001

## Project Structure
```
cardly/
├── controllers/        # Route logic
├── middleware/         # JWT auth middleware
├── models/             # SQLite database setup
├── routes/             # API route definitions
├── server.js           # Express app entry point
└── cardly-frontend/    # React frontend
    └── src/
        ├── context/    # Auth state management
        ├── pages/      # Home and Dashboard
        └── components/ # Reusable UI components
```

## Roadmap

- [ ] Card templates (minimal, bold, dark, creative)
- [ ] Export card as PNG / PDF
- [ ] Profile photo upload
- [ ] Social links (LinkedIn, GitHub, etc.)
- [ ] Public shareable card link

## Author

Connor Tan — [@ConnorXTan](https://github.com/ConnorXTan)
