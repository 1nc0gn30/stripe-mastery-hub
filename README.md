<!-- xonettn -->
<div align="center">

# 📚 Run and deploy your AI Studio app

This contains everything you need to run your app locally.


![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white)

![Deploy](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify&logoColor=white)

</div>

---

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>


This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0da26a27-bdc4-4e9f-8f09-cfac3568685d

## 🚀 Run Locally

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

---

<div align="center">

**[xonettn]** · Built by [Neal Frazier](https://github.com/1nc0gn30) · [@AshAmplifies](https://twitter.com/AshAmplifies)

</div>
