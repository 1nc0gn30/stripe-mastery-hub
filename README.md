<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0da26a27-bdc4-4e9f-8f09-cfac3568685d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. For local Netlify Function testing, run `netlify dev` and set `GEMINI_API_KEY` in your shell.

## Netlify AI Endpoints and Env Vars
- Endpoint: `POST /api/flow-architect` -> Netlify Function `netlify/functions/flow-architect.ts`
- Required env vars: `GEMINI_API_KEY`
- Fallback behavior: if `GEMINI_API_KEY` is missing, UI stays in explicit coming-soon mode.
