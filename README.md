# LegalAssistant

A plain-language legal rights chatbot + legal aid directory for India, built for LexHack 2026 (Access to Justice & Civic Tech track).

This version has a real backend: the chatbot calls the free Google Gemini API to answer questions, grounded in a legal knowledge base, instead of simple keyword matching. If the backend isn't set up or reachable, it automatically falls back to local keyword matching, so the app still works either way.

## Project structure

```
legalassistant-project/
├── index.html          # Frontend: chat, "Learn about the law", and directory tabs
├── api/
│   └── ask.js           # Backend: serverless function that calls the Gemini API
├── package.json         # No external dependencies needed (uses built-in fetch)
├── .env.example          # Template for your API key
└── README.md
```

## Option A: Deploy with a real backend (Vercel — recommended, free)

This gives you real AI-powered answers, at no cost.

1. **Get a free Gemini API key**: go to https://aistudio.google.com/apikey, sign in with a Google account, and click "Create API Key". No credit card required.
2. **Push this project to a GitHub repo** (create a new repo, upload all these files, including the `api` folder).
3. **Deploy on Vercel**:
   - Go to https://vercel.com, sign in with GitHub.
   - Click "Add New Project" → import your repo.
   - Vercel auto-detects the `api/ask.js` file as a serverless function — no extra config needed.
   - Before deploying, go to **Settings → Environment Variables** and add:
     - Key: `GEMINI_API_KEY`
     - Value: your API key from step 1
   - Click **Deploy**.
4. You'll get a live URL like `legalassistant.vercel.app` — the chatbot on this URL will now use real Gemini-powered answers.

## Option B: Deploy without a backend (static only)

If you just want the working prototype live quickly (e.g. for a demo link) without setting up an API key:

- Upload only `index.html` (rename it if needed) to GitHub Pages or Netlify Drop.
- The chatbot will automatically use the local keyword-matching knowledge base, since there's no `/api/ask` backend to call.
- Nothing else needs to change — the same file supports both modes.

## Testing locally

You'll need [Vercel CLI](https://vercel.com/docs/cli) to run the backend function locally:

```bash
npm install -g vercel
vercel dev
```

Then create a `.env` file (copy `.env.example`) with your real Gemini API key, and open the local URL Vercel CLI gives you.

## Notes for judges / submission

- The knowledge base (36 legal topics across tenant rights, consumer rights, workplace rights, civic rights, family & safety, property, cyber crime, and criminal matters) is shared between the frontend fallback and the backend prompt, so answers stay grounded in the same vetted content whether or not the API is reachable.
- The backend never lets the model invent legal information outside the provided reference material — it's instructed to say so and point to the legal aid directory instead.
- The Gemini API's free tier (used here) has generous rate limits suitable for demos; for production scale, consider a paid tier or a different provider.
- This is general legal information, not legal advice — the app disclaims this clearly to users.
