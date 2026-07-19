# Resume Analyzer — Local Setup

Prerequisites
- Node.js 18+ (or Bun)
- Git

Install dependencies

Using Bun:

```bash
bun install
```

Using npm:

```bash
npm install
```

Run locally

Start dev server (Vite):

```bash
npm run dev
# or
bun run dev
# or
pnpm dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Environment variables

Copy `.env.example` to `.env` and fill in values for your Supabase project. Required variables:

- `VITE_SUPABASE_URL` (client)
- `VITE_SUPABASE_ANON_KEY` (client)
- `VITE_BACKEND_URL` (only if your backend is not on the default port)

Notes
- This project includes Cloudflare/Wrangler config for deployment; local development uses Vite.
- The repository previously contained a `.env` file with example keys — make sure to replace with your own secrets and do not commit them.

If you want, I can also:

- Add a script to help generate `.env` from `.env.example`.
- Validate the app runs locally and fix any runtime errors.
