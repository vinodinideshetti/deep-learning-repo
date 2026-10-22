# Frontend (React + Vite)

## Routes

| Path | Page |
|------|------|
| `/` | Landing (top nav only; no sidebar) |
| `/dashboard` | API status, class count, history count, shortcuts |
| `/analyze` | Upload & prediction |
| `/classes` | Searchable class browser |
| `/history` | Local recent runs |
| `/tips` | Photo guidelines |
| `/about` | Model info & disclaimer |
| `/qa` | Q&A bot (50 curated answers + chat matcher) |

**Dark mode:** sun/moon button in app header and on the landing nav. **Settings** still syncs theme on save.

## UI

- **Side nav**: Home, Dashboard, Analyze, Classes, History, Photo tips, About; Settings at bottom; collapse on desktop (← Collapse).
- **Mobile**: hamburger opens the same nav as an overlay.

## Run

```bash
npm install
npm run dev
```

Backend: `uvicorn api.app:app --port 8010` (or set `VITE_API_URL` / Settings).
