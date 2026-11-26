# Job Tracker

A personal tracker for applications from any source: a company site, a referral, a job board, or LinkedIn.

## Run

```bash
npm install
cp .env.example .env
```

Set `APP_PASSWORD` and `AUTH_SECRET` in `.env`, then:

```bash
npm run dev
```

Open http://localhost:3000 and sign in. Jobs are stored in `data/tracker.db`. Follow-up dates and “today” use the timezone of the machine running the app.

## Use it on your phone

Run `npm run build` and `npm start` on one computer that stays on, then open that computer’s address from your phone. Keep a single long-running Node process. A serverless host with many instances will not share this SQLite file.
