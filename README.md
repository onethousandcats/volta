# Volta

Volta is a fast, local-first Gmail reader built for inbox triage. Phase 1 focuses on three things: quick Gmail login, a virtualized inbox list, and IndexedDB-backed caching so reloads stay instant.

## Stack

- React + TypeScript + Vite
- Zustand for app state
- TanStack Query for Gmail fetch orchestration
- IndexedDB via `idb`
- Tailwind CSS for minimal styling

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create an env file:

```bash
cp .env.example .env
```

3. Add your Google OAuth client ID to `.env`:

```bash
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

4. In Google Cloud Console:

- Enable the Gmail API.
- Create an OAuth client for a web app.
- Add `http://localhost:5173` to Authorized JavaScript origins.
- Use the Gmail read-only scope: `https://www.googleapis.com/auth/gmail.readonly`

5. Start the app:

```bash
npm run dev
```

## Phase 1 Behavior

- Gmail access tokens are kept in memory only.
- Inbox threads are synced on login and stored in IndexedDB.
- The thread list renders from IndexedDB on reload before any network work happens.
- Thread details are fetched on demand and cached locally.
- Attachments are detected but shown as placeholders only.

## Build

```bash
npm run build
```
