# Call Center Dashboard

A Next.js dashboard for monitoring call center performance across setters, confirmers, and GSP teams. It tracks horsepower, connection rates, scorecards, checkout-to-dial time, and related KPIs with role-based access for admins and agents.

## Features

- **Role-based access** — Admins see team-wide metrics; agents see their own stats
- **Multi-team views** — Setters, Confirmers, and GSP tabs with gauges, featured metrics, and drill-down tables
- **Date and filter controls** — Primary and secondary date ranges, employee filters, call-bucket filters, and time-of-day filtering
- **Record exclusions** — Admins can exclude individual records from metric calculations
- **User management** — Admins can create and manage Firebase-authenticated users
- **Demo account** — Portfolio visitors can sign in with a demo user to explore the UI using sample data only

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Firebase](https://firebase.google.com/) — Authentication and Firestore user profiles
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [SWR](https://swr.vercel.app/) — Client-side data fetching and refresh

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Email/Password auth enabled
- Access to the dashboard metrics API (production) or demo mode configuration

### Installation

```bash
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client configuration |
| `NEXT_PUBLIC_DEMO_EMAIL` | Demo user email shown on the login page |
| `NEXT_PUBLIC_DEMO_PASSWORD` | Demo user password shown on the login page |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Optional. Required for server-side user deletion |

### Demo User Setup

1. Create a Firebase Auth user matching `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD`
2. Add a Firestore document at `users/{uid}` with `role: "demo"`

Demo users receive fictional dashboard data and can explore excluded records and user management with sample data. They cannot modify real users or production metrics.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
app/                  # Next.js routes and API handlers
components/           # UI components (dashboard, auth, users)
contexts/             # React context providers (auth, theme)
hooks/                # Custom hooks
lib/                  # Firebase, filters, demo data utilities
```

## Deployment

The app is designed to deploy on [Vercel](https://vercel.com/) or any Node.js host that supports Next.js. Set environment variables in your hosting provider before deploying.

## License

Private — not licensed for redistribution without permission.
