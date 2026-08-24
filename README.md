# PrepPilot 🚀

An AI-powered interview preparation platform that actually looks at _your_ resume and _your_ target job description — not generic questions pulled off some list.

Built with the MERN stack + Google's Gemini API. Started as a way to fix my own messy interview prep (too many tabs, too many "top 50 questions" articles that had nothing to do with the actual job) and turned into a full project.

---

## What it does

You give it three things:

- Your resume
- A short self-description
- The job description you're applying for

And it gives you back:

- A **match score** (0–100) — how well your profile actually fits the role
- 8–10 **technical questions** you're likely to get asked, with the intent behind each one and how to answer it
- 5–7 **behavioral questions**, same format
- A list of **skill gaps** (rated low / medium / high) so you know what actually matters vs. what's a nitpick
- A **day-wise prep plan** that's built around closing those specific gaps — not a generic "revise DSA for 30 days" plan
- An **AI-enhanced resume**, rewritten to better match the job description, exportable as a clean one-page PDF

Basically it turns "I have an interview in 5 days and no idea where to start" into an actual plan.

## Why I built it this way

The interesting part of this project wasn't calling the Gemini API — that's the easy bit. It was making sure the AI's response was actually _usable_. LLMs don't always return exactly what you ask for, so I couldn't just dump the raw response onto the screen and hope for the best.

So the whole thing is built around a strict schema:

- I define exactly what a "report" should look like using **Zod**
- That schema gets converted into a JSON schema and passed straight to Gemini's structured output config
- Whatever comes back gets validated against the same Zod schema _again_ before it's allowed anywhere near the database or the frontend

If the AI ever returns something malformed, it gets caught right there instead of quietly breaking the UI later. Took a lot of debugging (cascading schema/API/DB issues are not fun at 1am) but it made the whole app way more reliable.

## Tech Stack

**Frontend**

- React
- SCSS (dark theme, red/pink accents — wanted it to feel like an actual SaaS product, not a college project)

**Backend**

- Node.js + Express
- MongoDB + Mongoose
- Zod — schema validation for AI output
- Puppeteer — turns AI-generated HTML into a downloadable resume PDF

**AI**

- Google Gemini API (`@google/genai`) with structured JSON output

## Project structure

```
preppilot/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/       # SCSS
├── server/               # Express backend
│   ├── routes/
│   ├── services/
│   │   └── interview.js  # core Gemini + Zod logic lives here
│   ├── models/
│   └── server.js
```

## Known limitations

- No RAG yet — questions are generated purely from the model's own reasoning, not grounded against a curated question bank
- No progress tracking — you can't check off tasks in the prep plan and have it remember
- If Gemini's API is slow or down, there's no retry logic yet, it just fails and logs the error
- Tested manually, no automated test suite (yet)

## What's next

- [ ] Retrieval-Augmented Generation (RAG) for more grounded questions
- [ ] Progress tracking on the prep plan
- [ ] Retry/fallback logic for AI failures
- [ ] Deploy it properly instead of just running it locally
- [ ] Maybe a history view so you can see past reports instead of losing them

## A note on the AI part

If you're looking at this thinking "cool, another ChatGPT wrapper" — fair, at first glance it kind of looks like one. But the actual engineering effort here wasn't the API call itself, it was making the AI's unpredictable output behave like reliable application data. That's the part I'd actually want to talk about if you ask me about this project.

---

Built by Noor Saqib. If you spot a bug or have ideas, feel free to open an issue.
