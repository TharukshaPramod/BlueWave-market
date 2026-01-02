# Seafood Marketplace — Frontend

A modern React + Vite frontend for the Seafood Marketplace application.

This README documents how to set up, run, build, and contribute to the frontend portion of the project.

## Key Features

- Vite + React for fast development and HMR
- Centralized state management (see `src/store/store.js`)
- Components for cart, authentication, payments, and admin pages

## Tech Stack

- React (JSX) with Vite
- Fetch / REST API client to the backend server
- ESLint for linting

## Prerequisites

- Node.js 16+ (LTS recommended)
- npm or yarn

## Quick Start (development)

Open a terminal and run:

```powershell
cd frontend
npm install
npm run dev
```

The app will be served by Vite (usually at `http://localhost:5173`).

## Build for Production

```powershell
cd frontend
npm run build
```

The built files will be emitted to the `dist/` directory. Serve them with a static host or integrate with your backend.

## Environment Variables

If the frontend expects environment variables, add them to a `.env` file in `frontend/` (do NOT commit `.env` files). Example:

```
VITE_API_BASE_URL=http://localhost:5000
```

Vite exposes variables prefixed with `VITE_` to the client.

## Project Structure (important files)

- `src/` — React sources
	- `components/` — shared UI components (Cart, Navbar, Login, etc.)
	- `pages/` — route-level pages (Home, AdminDashboard, Checkout)
	- `store/` — Redux / Zustand / custom store setup
- `public/` — static assets
- `vite.config.js` — Vite config

## Common Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build locally (if configured)

## Linting & Formatting

If ESLint and/or Prettier are configured, run:

```powershell
npm run lint
npm run format
```

Adjust commands to `yarn` if you prefer.

## Connecting to Backend

The frontend makes API calls to the backend server located in `../backend`. Ensure the backend is running and `VITE_API_BASE_URL` (or equivalent) points to the backend address.

## Contributing

- Fork the repo and open a branch per feature: `feature/<short-description>`
- Keep commits small and focused
- Open a pull request with a clear description and testing instructions

## Troubleshooting

- Port conflicts: change Vite port with `--port` or in `vite.config.js`
- CORS errors: enable CORS in backend during development or proxy requests

## License & Contact

Specify your license here and a contact point for maintainers.

----

If you want, I can also:

- Create a top-level `README.md` summarizing the whole project (frontend + backend)
- Add a `CONTRIBUTING.md` and `LICENSE`

Tell me which you'd like next.
