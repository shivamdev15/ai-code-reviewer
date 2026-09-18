# 🧠 AI Code Reviewer

Beginners often write code with no feedback until a human review comes back — which can take days. This tool gives **instant, structured code review feedback** on any snippet, powered by Google Gemini.
**🔗 Live demo: [ai-code-reviewer-a1s7.onrender.com](https://ai-code-reviewer-a1s7.onrender.com/)** (may take 30-50 seconds to load on first visit — free tier sleeps when idle)

## What it does

Paste a code snippet, pick a language, and get back:
- An overall quality score (1–10)
- Potential bugs
- Security concerns
- Readability suggestions
- General improvement suggestions

All returned as structured categories, not a wall of text — closer to how a senior engineer actually leaves review comments.

## Tech stack

- **Backend:** Node.js + Express
- **AI:** Google Gemini API (`gemini-3.6-flash`)
- **Frontend:** Vanilla HTML/CSS/JavaScript (no framework, kept simple on purpose)

## Running it locally

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and add your free Gemini API key (get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)):
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in your browser.

## Why I built this

I wanted a project that showed I can work with AI APIs thoughtfully, not just wire one up — most of the actual engineering here is in the review prompt design (see `server.js`), which forces the model to return consistent, structured feedback instead of freeform chat text.

## Possible improvements

- Support pasting a GitHub PR/commit link instead of raw text
- Persist past reviews per user
- Add streaming responses for faster perceived feedback
