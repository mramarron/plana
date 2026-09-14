# Plana

Plana is a modern personal finance app built to make budgeting, spending awareness, and saving goals easier to manage from a mobile-first experience. It blends a premium product feel with a practical local-first architecture so users can track money without needing a backend.

## Product overview

Plana helps users:

- understand their financial picture at a glance
- capture income and expenses quickly
- stay on top of monthly budgets
- build momentum toward savings goals
- explore clean, visual summaries of spending trends
- switch seamlessly between light and dark themes

## Why Plana

- Local-first and privacy-friendly
- Designed for everyday financial clarity
- Built around real spending habits, categories, and goals
- Clean mobile UI with modern glass-inspired navigation

## Key features

- Overview dashboard with live summaries and chart-style visuals
- Transaction entry for income, expenses, and category-based records
- SQLite-backed persistence with reusable categories and default seeds
- Budget tracking with month-aware summaries and category breakdowns
- Goal tracking with create, edit, delete, and progress visibility
- Responsive, theme-aware interface for mobile use

## Screenshots

> Add screenshots here when available to showcase the overview, transactions, budgets, and goals experience.

## Tech stack

- Expo SDK 57
- Expo Router
- React Native + TypeScript
- Expo SQLite
- Lucide React Native
- React Native SVG
- Reanimated
- Safe Area Context

## App structure

- `src/app` — screens, routes, and navigation layouts
- `src/components` — shared interface components
- `src/lib/db.ts` — database setup, seed data, and query helpers
- `src/constants/theme.ts` — shared theme values and colors
- `assets` and `images` — app visuals and icons

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npm start
```

### 3. Run on a target

```bash
npm run android
npm run ios
npm run web
```

## Developer onboarding

### Project conventions

- Expo Router is used for file-based routing.
- Screen and feature modules live under `src/app`.
- Database logic, seeded data, and query helpers live in `src/lib/db.ts`.
- Shared styling and theme tokens are centralized in `src/constants/theme.ts`.
- Reusable UI should be placed in `src/components` before creating new one-off components.

### Typical development workflow

1. Add or update the screen in `src/app`.
2. Extend the relevant database helpers in `src/lib/db.ts` if the feature needs persistence.
3. Reuse existing components and theme values where possible.
4. Verify with TypeScript after making changes.

### Useful commands

```bash
npm start
npm run android
npm run ios
npm run web
npm run reset-project
npx expo lint
npx tsc --noEmit
```

### Contributor notes

- Data is stored locally with SQLite, so records remain available on-device.
- Default categories are seeded on first launch to help new users get started quickly.
- Dashboard and budget views are designed around date-aware filtering and current-month context.
- The app is organized into modules such as overview, transactions, budgets, and goals to keep feature work manageable.

## Roadmap

Plana is intended to grow into a more complete personal finance workspace, with future areas such as:

- richer analytics and reporting
- recurring transactions
- smarter category automation
- deeper budgeting insights
- export and backup capabilities

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
