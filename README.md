# SkillTrack — AI-Powered Learning & Career Platform

A responsive MERN-stack SaaS-style application for learning, skill-gap analysis, resume analysis, and job application tracking.

## Stack

- Frontend: React + Vite + Tailwind CSS + React Router + Axios + Recharts
- Backend: Node.js + Express.js + MongoDB + Mongoose + JWT + bcrypt
- Optional AI: OpenAI-compatible API endpoint through the backend
- Responsive: mobile-first Tailwind CSS for phones, tablets, laptops and large screens

## Features

- JWT authentication
- User/Admin roles
- Responsive dashboard
- Course browsing, search and filtering
- Course enrollment
- Lesson progress tracking
- Quizzes and scoring
- In-course quizzes with recent attempt history
- Toggleable lesson completion and accurate course progress
- Daily learning goals, quick study-time logging, seven-day activity chart and streaks
- Skill-gap analysis
- Resume analysis UI
- Job application tracker with search, status filters, dates, job links and interview reminders
- Admin dashboard
- Admin completion metrics and application-pipeline chart
- Recharts analytics
- Toast notifications
- Dark/light UI-ready design system
- API error handling
- MongoDB seed data
- Optional AI integration with a safe mock fallback

## Requirements

- Node.js 18+ (Node 20+ recommended)
- npm 9+
- MongoDB local installation OR MongoDB Atlas

## 1. Install dependencies

Open two terminals.

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd client
npm install
```

## 2. Configure environment variables

### server/.env

Copy `server/.env.example` to `server/.env`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/skilltrack
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173

# Optional AI configuration
AI_API_URL=
AI_API_KEY=
AI_MODEL=
```

The AI endpoint is optional. Without it, SkillTrack returns useful demo/mock analysis so the whole project works locally.

### client/.env

Copy `client/.env.example` to `client/.env`.

```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Start MongoDB

If using local MongoDB, make sure the MongoDB service is running.

If using Atlas, put your Atlas connection string in `MONGO_URI`.

## 4. Seed demo data

In the backend terminal:

```bash
cd server
npm run seed
```

This creates demo users, courses, lessons, quizzes, skills and job applications.

### Demo accounts

User:

```text
Email: user@skilltrack.dev
Password: User@123
```

Admin:

```text
Email: admin@skilltrack.dev
Password: Admin@123
```

## 5. Run the application

### Backend

```bash
cd server
npm run dev
```

API:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### Frontend

In another terminal:

```bash
cd client
npm run dev
```

Open:

```text
http://localhost:5173
```

## What you can do after signing in

- Enroll in a course, complete or reopen lessons, and see progress update immediately.
- Take the course knowledge check; the latest score and up to five recent attempts are retained.
- Use the AI Career workspace with no AI key configured—the server returns deterministic local feedback—then optionally connect an AI provider later.
- Add applications with applied/interview dates, notes and a job-post link; search and filter the pipeline or change each application’s status in place.

## Production builds

Frontend:

```bash
cd client
npm run build
npm run preview
```

Backend:

```bash
cd server
npm start
```

## Project structure

```text
skilltrack-mern/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   ├── services/
│   │   └── app.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── README.md
```

## AI integration

The project deliberately keeps AI optional.

To connect an OpenAI-compatible service, set:

```env
AI_API_URL=https://your-provider.example/v1/chat/completions
AI_API_KEY=your_key
AI_MODEL=your_model
```

The backend sends a structured prompt and expects a normal chat-completions response. If the values are missing or the provider fails, a deterministic local analysis is returned instead.

## Responsive design

The UI uses Tailwind's mobile-first breakpoints:

- default: phones
- `sm`: large phones/small tablets
- `md`: tablets
- `lg`: laptops
- `xl`: desktops
- `2xl`: large displays

No fixed desktop-only layout is used. Navigation collapses on smaller screens, tables become cards where appropriate, grids stack naturally, and forms remain touch-friendly.

## Important note

This is a complete runnable starter/portfolio project. Production deployment should additionally add rate limiting, CSRF strategy where applicable, secure cookie/token storage, email provider configuration, object storage for uploaded resumes, automated tests, monitoring, and secrets management.
