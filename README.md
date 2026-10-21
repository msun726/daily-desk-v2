# Daily Desk

A local-first productivity workbench built with JavaScript, HTML, CSS, IndexedDB, and an Electron desktop shell. Updated to the local v0.2.0 source snapshot from October 20, 2026.

[Source repository](https://github.com/msun726/daily-desk-v2)

## Features

- Separate study, job search, life, and custom spaces.
- Calendar-linked tasks, deadlines, project folders, and progress.
- Custom courses, review materials, completion tracking, and a review structure map.
- Job application tracking, supporting documents, and CV workspace.
- Wallpaper customization and full backup/restore of local data and attachments.
- Electron window controls and external shortcuts to Gmail, Google, and Canvas.

Gmail is an external shortcut, not an inbox integration. The current desktop app disables AI requests; this is not an enabled AI feature. Legacy optional AI service modules are retained as source.

## Browser

Open `index.html` directly. This repository does not yet have a hosted browser version. Keep all JavaScript files beside it. Data is stored in the current browser using localStorage and IndexedDB; there is no account or cloud synchronization. Desktop window controls are available only in Electron.

The previous demo used a separate sample-data storage namespace. This version starts with empty task and course lists. Export any previous browser data before switching versions; browser data and desktop app data are separate.

## Desktop development

Requires Node.js and npm:

```sh
npm install
npm start
```

Run `npm run check` for JavaScript syntax checks. To choose a data directory, set `DAILY_DESK_DATA_DIR` to an absolute path before launching. Back up your data using the full backup action before moving or updating an existing installation.

## Source layout

- `index.html`, `desk-core.js`: workbench layout, tasks, calendar, and spaces.
- `review.js`, `review-map.js`: study materials and review map.
- `career.js`: job search workspace.
- `full-backup.js`: local data and attachment backup/restore.
- `main.mjs`, `preload.cjs`, `desktop-ui.js`: Electron shell and desktop bridge.
- `ai-server.mjs`, `job-ai.mjs`, `course-ai.js`: legacy optional AI modules, not enabled in the current desktop workflow.

Only application source and existing demo assets are published. Personal task data, browser profiles, CV files, attachments, credentials, and the installed Electron runtime are not included.

Built with AI assistance and iteratively refined through hands-on user feedback. Current limitations include no cloud sync, automated inbox reading, or verified cross-device support. The existing background photograph has no reuse license granted by this repository.
