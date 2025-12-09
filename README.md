# File Integrity Monitoring (FIM)

Real-time file integrity monitoring (backend: Node/Express/Mongo, frontend: React/Vite/Tailwind) with hashing, diffs, restore, and protected backups.

## Key Features
- Watcher: chokidar-based CREATE/MODIFY/DELETE detection with SHA-256 hashes, metadata, and text diffs.
- Events: stored in MongoDB with stats and history APIs; real-time via Socket.io.
- Severity: auto-calculated by change volume (LOW/MEDIUM/HIGH/CRITICAL) with a critical alert banner in the dashboard.
- Restore: revert modified files using cached previous content (MODIFY events only).
- Protection backup: `POST /api/protect` encrypts and version-tags a snapshot to a protected folder and best-effort locks writes.
- UI: live dashboard, filters, event modal (hashes, metadata, diff), copy file path button, colored badges.
- Auth: JWT with roles; CORS controlled by env.
- Email alerts: optional (disabled by default via `ENABLE_EMAIL_ALERTS=false`).

## Project Structure (summary)
- `backend/`
  - `server.js` (Express + Socket.io)
  - `services/` WatcherService, HashService, DiffService, MetadataService, ProtectionService, EmailService (optional)
  - `controllers/` auth, file events, protection
  - `routes/` auth, events, protect
  - `models/` User, FileEvent
  - `config/database.js`, `middleware/`, `utils/logger.js`
- `frontend/`
  - `src/pages/Dashboard.jsx` (stats, live table, critical banner)
  - `src/components/` EventTable, EventModal (restore button + copy path), Filters, Header, Login, etc.
  - `src/services/api.js`, `src/services/socket.js`

## Environment (.env examples)
Backend `.env` (current sample):
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
PORT=5000
NODE_ENV=development
WATCH_DIRECTORY=C:/path/to/watch
CORS_ORIGIN=http://localhost:5173
ENABLE_EMAIL_ALERTS=false
PROTECTED_BACKUP_DIR=protected_backups
BACKUP_ENCRYPTION_KEY=32_byte_key_here_optional
```
Frontend env: default Vite target `http://localhost:5000` via `src/services/api.js`; adjust if needed.

## Setup
1) Install backend deps:
```
cd backend
npm install
```
2) Install frontend deps:
```
cd ../frontend
npm install
```
3) Ensure MongoDB is reachable at `MONGODB_URI`.
4) Set `WATCH_DIRECTORY` to the folder you want to monitor (make sure it exists or will be created).

## Run (dev)
- Backend: from `backend/` run `npm run dev`
- Frontend: from `frontend/` run `npm run dev`
- Open http://localhost:5173

## Demo Script
1) Log in (register an admin via `/api/auth/register` if needed).
2) Edit a watched text file and add >100 lines -> a CRITICAL MODIFY event appears; dashboard shows a red alert banner.
3) Open the event modal: view hashes, metadata, diff; use the copy-path button.
4) Click Restore (MODIFY events) to revert to previous cached content.
5) Call `POST /api/protect` with `{"filePath": "<path>"}` or `{"eventId": "<id>"}` to snapshot + encrypt + version-tag; source is set read-only when possible. Backups are ignored by the watcher (no recursion).

## API Quick Reference
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Events: `GET /api/events`, `GET /api/events/stats`, `GET /api/events/:id`, `GET /api/events/history/:filePath`, `DELETE /api/events/:id` (admin), `POST /api/events/:id/restore` (MODIFY restore)
- Protect: `POST /api/protect` (body: `filePath` or `eventId`)
- Restore backup: `POST /api/protect/restore` (body: `backupPath` or `metaPath`, optional `destinationPath`)

## Notes & Limitations
- Restore relies on cached old content; it only works for MODIFY events observed by the watcher (not for deleted or never-cached files).
- Backups are encrypted to `PROTECTED_BACKUP_DIR`; restore-from-backup is available via `POST /api/protect/restore`.
- Email alerts are off by default; set SMTP and `ENABLE_EMAIL_ALERTS=true` to enable.

## Troubleshooting
- Frontend fails to start: ensure `npm install` ran in `frontend/`; retry `npm run dev`.
- Backend fails to start: verify `MONGODB_URI`, `WATCH_DIRECTORY` exists, and `npm install` succeeded.
- No events: confirm watcher path is correct and not excluded; backups folder is ignored by design.

## License
ISC.
