# qbo-frontend-updated (Option A)

This frontend uses Tailwind CSS and provides a professional receipt UI with:
- Bordered 80mm printable receipt preview
- Preview and Print buttons on each receipt row
- Auto-refresh every 5 seconds, keeps max 50 receipts, paginates 10 per page

Env vars (Vercel):
- VITE_API_BASE
- VITE_RECEIPTS_API_KEY

Build:
- npm install
- npm run build
- deploy `dist` to Vercel
