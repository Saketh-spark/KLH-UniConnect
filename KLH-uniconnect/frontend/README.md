# UniConnect Frontend

Structure outline:
- `src/features/`: feature modules housing components, hooks, and state for each domain slice (connections, messaging, notifications).
- `src/components/`: shared UI primitives (cards, dialogs, avatars).
- `src/assets/`: static assets (images, fonts, SVGs).
- `src/services/`: API clients (Axios instances) and utilities that talk to backend.
- `public/`: static files (favicon, robots, index.html template).

## Setup
1. Install dependencies with `npm install`.
2. Start the dev server with `npm run dev`.
3. Configure `src/services/api.ts` to point at the backend base URL.
