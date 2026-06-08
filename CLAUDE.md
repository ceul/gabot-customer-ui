# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Workflow

**Planning**: use gstack before any multi-step task.
**Development**: use superpowers skills — `superpowers:test-driven-development` before any implementation code, `superpowers:systematic-debugging` before any fix, `superpowers:brainstorming` before any new feature.
**TDD**: write the failing test first, always. No exceptions.
**SOLID**: Single Responsibility · Open/Closed · Liskov · Interface Segregation · Dependency Inversion — apply to every component and module.

## Commands

```bash
# Install dependencies
npm install

# Dev server (port 3000, proxies /api and /socket.io to localhost:5000)
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

## Architecture

**Stack**: React 19, Vite 8, Tailwind 4, React Router 7, Socket.io client, axios, react-hook-form, dnd-kit, lucide-react.

**Proxy**: Vite dev server proxies `/api` → `http://localhost:5000` and `/socket.io` → `http://localhost:5000` (ws). No CORS issues in dev.

**Structure:**
- `src/api.js` — axios instance and all API call functions
- `src/socket.js` — Socket.io client singleton
- `src/context/` — React context providers (auth, app state)
- `src/pages/` — route-level page components
- `src/components/` — reusable UI components

**Design principles**: mobile-first (restaurant owners manage from their phone), Spanish-first UI copy.

## UI Design

Use **Stitch** (Google) via MCP for all UI design work before implementing components. Design → Stitch → implement in React.
