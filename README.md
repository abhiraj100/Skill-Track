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
- Responsive dashboard with 24-module flagship training arena launcher
- API Benchmark & Concurrency Load Testing Studio: Simulate up to 1,000 concurrent Virtual Users (VUs), live request rate (RPS), P50/P90/P95/P99 latency percentiles, bottleneck diagnostic engine, and 1-click runnable k6 script export (`/load-tester`)
- Web Vitals & Frontend Performance Audit Studio: Core Web Vitals diagnostic (LCP, INP, CLS, FCP, TTFB), asset waterfall timeline, and 1-click remediation toggles (Code Splitting, Image formats, Font preload, Critical CSS) with real-time score updates (`/perf-audit`)
- Database Schema & Visual ERD Studio: Interactive Entity Relationship Diagram canvas with foreign key connectors, industry presets (E-Commerce, B2B SaaS, LMS), and 1-click PostgreSQL DDL SQL & Prisma schema export (`/erd-studio`)
- Design Systems & Accessible UI Component Sandbox: Live design tokens customizer (HSL palette, corner radius, shadows), interactive component state matrix, WCAG 2.1 AA/AAA contrast checker, color-blindness simulator, and Tailwind exporter (`/design-system`)
- Cloud Architecture Studio & AWS Cost Estimator: Interactive multi-tier topology designer, real-world presets (SaaS, Video Streaming, AI Inference, Serverless), live monthly cost calculator ($/mo), and 1-click Terraform IaC code export (`/cloud-architect`)
- Web Security & OWASP Pentest Sandbox: Hands-on interactive exploits and defenses for SQL Injection, Stored/Reflected XSS with CSP, JWT signature tampering & CVE-2015-9235 "none" algorithm bypass, CORS/CSRF headers, and an interactive OWASP Top 10 audit scorecard (`/security-lab`)
- Tech Salary & Offer Negotiation Intelligence: Market total compensation (TC = Base + RSU + Bonus) explorer across 5 engineering tracks & 5 seniority levels (L3 to L7), 4-year RSU vesting schedule simulator with equity appreciation slider, side-by-side offer comparison matrix, and high-leverage counter-offer email generator (`/salary-radar`)
- Interactive Regex & ReDoS Vulnerability Lab: Real-time regex match highlighter, capture groups inspector, production pattern library (RFC 5322 Email, Strong Password, SemVer, IPv4, JWT), and static Catastrophic Backtracking (ReDoS) vulnerability static analyzer with adversarial micro-benchmark stress-tester (`/regex-lab`)
- Docker & Kubernetes Container Studio: Multi-stage Dockerfile layer builder, layer cache inspector, Compose fleet simulator with fault injection, and live Kubernetes HPA pod autoscaler (`/docker-lab`)
- Kafka & Microservices Event Bus Simulator: Distributed pub/sub streaming, partition hash routing, dead-letter queue (DLQ) with exponential backoff, and circuit breaker state machine (`/microservices-lab`)
- CI/CD Pipeline & GitHub Actions Studio: 8-stage visual DAG runner, live build console logs, and editable `.github/workflows/deploy.yml` YAML builder (`/cicd-pipeline`)
- 1v1 Real-Time Code Duel Arena: Live speed coding battles vs AI bots, rival telemetry typing progress, automated test suite runner, and ELO ladder ratings (`/code-arena`)
- Git & UNIX Terminal Lab with interactive bash shell, realistic command parsing (`git status`, `add`, `commit`, `branch`, `checkout`, `merge`, `log`), and live visual SVG commit graph topology (`/terminal-lab`)
- REST API Client Studio: Postman-style in-browser HTTP client with method switcher, headers/body JSON editor, latency timer, status badge, formatted viewer, and preset test endpoints (`/api-tester`)
- Gamified Global Developer League Leaderboard: 7 tiered leagues (Bronze to Legend), top-3 podium, streak champions, XP breakdown, and user rank spotlight card (`/leaderboard`)
- Peer Study Buddy & Pair Network: 1-on-1 matchmaking by career track, schedule mock interview sessions, collaborative study squads, and live presence indicator (`/study-buddy`)
- System Design Arena with Live Traffic Simulator, 10x Black Friday Spike trigger, interactive architecture canvas, case studies (TinyURL, Netflix, WhatsApp, Rate Limiter), and QPS capacity calculator (`/system-design`)
- SQL & MongoDB Query Studio with in-browser query execution, visual data tables, and query execution plan analyzer (`/query-lab`)
- ATS Resume Builder & PDF Studio with 1-click SkillTrack verified credentials auto-import, ATS score checker, and printable export (`/resume-builder`)
- Real-time Notification Center with unread badge counter and activity feed (`AppLayout`)
- Community Discussions & Peer Q&A Forum with voting, categories, accepted solutions, and threaded replies (`/community`)
- Smart Flashcards & Spaced Repetition Decks with 3D flip card animations and custom deck builder (`/flashcards`)
- Guided Capstone Projects Studio with real-world architecture specs, milestone checklists, and submission portal (`/projects`)
- Live Developer Portfolio & Public Profile with verified credentials, skills, and printable PDF resume export (`/portfolio`)
- Dark / Light Mode Theme Engine with persisted user preference and high-contrast styling
- AI Mock Interview Simulator with speech-to-text, real-time AI scoring, and ideal model answers (`/interview`)
- Interactive Code Lab with in-browser algorithmic challenges, execution sandbox, test runner, and hints (`/codelab`)
- Visual Interactive Career Roadmaps with milestone skill trees and progress tracking (`/roadmaps`)
- Pomodoro Deep Focus Station with Web Audio ambient soundscapes (rain, alpha waves) and streak auto-sync (`/focus`)
- Verifiable Course Completion Certificates with cryptographic verification IDs, printable credentials, and public lookup (`/certificates`)
- AI Cover Letter & Recruiter InMail outreach generator (`/career`)
- Course browsing, search and filtering
- Course enrollment
- Lesson progress tracking
- Quizzes and scoring
- In-course quizzes with recent attempt history
- Toggleable lesson completion and accurate course progress
- Daily learning goals, quick study-time logging, seven-day activity chart and streaks
- Mind Gym: timed quick-calculation sprints with difficulty levels, personal records and leaderboard
- Study Notes workspace with course links, tags, pinning, search, editing and deletion
- Achievement badges that reward learning, quizzes, notes, study time, applications and Mind Gym activity
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
- Optional AI integration with safe simulated mock fallbacks

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
# Leave blank locally: Vite proxies /api to the backend on port 5000.
VITE_API_URL=
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
