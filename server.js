// server.js
// Backend for the AI Code Reviewer Tool.
// Takes a code snippet + language, sends it to Claude with a structured
// "senior code reviewer" prompt, and returns categorized feedback.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '200kb' }));
app.use(express.static('public'));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The system prompt is the real "product" here — it's what makes the
// output structured and genuinely useful instead of generic chatbot text.
const SYSTEM_PROMPT = `You are a senior software engineer performing a code review.
You will be given a code snippet and its programming language.

Respond ONLY with a JSON object (no markdown fences, no preamble) in exactly this shape:
{
  "score": <integer 1-10, overall code quality>,
  "summary": "<one sentence overall verdict>",
  "bugs": ["<specific potential bug or logic issue>", ...],
  "security": ["<specific security concern, or empty array if none>"],
  "readability": ["<specific readability/style suggestion>", ...],
  "suggestions": ["<specific improvement suggestion, e.g. better patterns>", ...]
}

Rules:
- Be specific and reference actual variable/function names from the snippet.
- If a category has nothing to report, return an empty array for it — do not invent issues.
- Keep each bullet to one concise sentence.
- Never include text outside the JSON object.`;

app.post('/api/review', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Please provide a non-empty code snippet.' });
    }
    if (code.length > 20000) {
      return res.status(400).json({ error: 'Snippet is too long. Please limit to ~20,000 characters.' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Language: ${language || 'unspecified'}\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
        },
      ],
    });

    const rawText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/, '');

    let review;
    try {
      review = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse model output as JSON:', rawText);
      return res.status(502).json({ error: 'The AI response could not be parsed. Please try again.' });
    }

    res.json(review);
  } catch (err) {
    console.error('Review request failed:', err);
    res.status(500).json({ error: 'Something went wrong while generating the review.' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`AI Code Reviewer running on http://localhost:${PORT}`);
});
