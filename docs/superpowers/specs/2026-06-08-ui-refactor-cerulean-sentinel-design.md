# UI Refactor — Cerulean Sentinel Design System

**Date:** 2026-06-08  
**Status:** Approved  
**Scope:** `gabot-customer-ui` — all 9 pages

---

## Context

The current UI uses an ad-hoc indigo/gray Tailwind palette with no formal design system. Stitch (Google) has 4 completed screen designs for the admin panel using a consistent "Cerulean Sentinel" visual language. 5 pages have no Stitch designs yet. This refactor brings the entire app to a single, polished design system derived from those screens.

**Why now:** Phase 0 goal is a live pilot restaurant. The UI needs to feel production-quality for the first owner onboarding. The Cerulean Sentinel style (clean, light, professional) is appropriate for a restaurant management tool.

**What changes:** Visual styles only. No logic, API calls, state management, or routing changes.

---

## Design Direction: Cerulean Sentinel

All screens follow the "Cerulean Sentinel" theme — light mode, cerulean-blue primary, Space Grotesk headlines + Inter body.

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `background` | `#f8f9ff` | Page background |
| `surface` | `#ffffff` | Cards, modals |
| `surface-container` | `#eff1ff` | Subtle containers |
| `surface-container-high` | `#e8eaf6` | Hover states, nested sections |
| `primary` | `#0058be` | Primary buttons, active nav, links |
| `on-primary` | `#ffffff` | Text on primary bg |
| `on-surface` | `#0b1c30` | Main text |
| `secondary` | `#556070` | Secondary text, labels |
| `outline` | `#c2c6d6` | Input borders |
| `outline-variant` | `#e2e4ee` | Dividers (use sparingly) |
| `error` | `#ba1a1a` | Error states |

### Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Headlines, labels | Space Grotesk | 500–700 | `text-lg`–`text-2xl` |
| Body, inputs | Inter | 400–500 | `text-sm`–`text-base` |

### Shape

- Cards: `rounded-xl` (12px)
- Buttons: `rounded-full` (pill) for primary, `rounded-lg` for secondary
- Inputs: `rounded-lg`
- No hard 0px borders anywhere

---

## Stitch Project

**Project ID:** `4767975864860178078` ("Gabot AI Restaurant Bot")

### Existing screens (4)

| Screen | Maps to | Device |
|---|---|---|
| Panel de Control - Login (Mobile Refined) | `LoginPage.jsx` | Mobile |
| Panel de Control - Login | `LoginPage.jsx` | Desktop |
| Pedidos - Mobile (Refined Cerulean Style) | `OrdersPage.jsx` | Mobile |
| Pedidos - Kanban (Refined Cerulean Style) - Desktop | `OrdersPage.jsx` | Desktop |
| Conversaciones - Mobile (Refined Style) | `ConversationsPage.jsx` | Mobile |
| Conversaciones (Refined Cerulean Style) - Desktop | `ConversationsPage.jsx` | Desktop |
| Configuración del Restaurante (Refined Style) | `RestaurantPage.jsx` | Desktop |

### Screens to generate (5)

Generate these in the same project using `mcp__stitch__generate_screen_from_text`, explicitly requesting "Cerulean Sentinel" style. Prompt each with Spanish UI copy and mobile-first layout.

| Screen title | Maps to | Key elements |
|---|---|---|
| Configuración del Bot | `BotPage.jsx` | Bot name, language select, tone select, personality textarea, notification toggle |
| Horarios del Restaurante | `HoursPage.jsx` | 7-day table, open/closed toggle per row, time pickers |
| Menú del Restaurante | `MenuPage.jsx` | Category sections (collapsible), item list with name/price/description, add/delete |
| Promociones y Especiales | `SpecialsPage.jsx` | Day select, title/description inputs, active toggle, specials list |
| Métodos de Pago | `PaymentPage.jsx` | Cash/card toggles, bank account cards with QR upload |

---

## Architecture

### Files changing

| File | Change |
|---|---|
| `src/index.css` | Add CSS custom properties for Cerulean Sentinel tokens, import Space Grotesk + Inter from Google Fonts |
| `src/components/ui.jsx` | Update all 11 primitives to use token classes — same API, new visual output |
| `src/components/Layout.jsx` | Update sidebar to match Cerulean Sentinel nav pattern (light bg, blue active state) |
| `src/pages/LoginPage.jsx` | Match Stitch design |
| `src/pages/OrdersPage.jsx` | Match Stitch design (both Kanban and Table views) |
| `src/pages/ConversationsPage.jsx` | Match Stitch design |
| `src/pages/RestaurantPage.jsx` | Match Stitch design |
| `src/pages/BotPage.jsx` | Match generated Stitch design |
| `src/pages/HoursPage.jsx` | Match generated Stitch design |
| `src/pages/MenuPage.jsx` | Match generated Stitch design |
| `src/pages/SpecialsPage.jsx` | Match generated Stitch design |
| `src/pages/PaymentPage.jsx` | Match generated Stitch design |

### Files NOT changing

- `src/api.js` — no changes
- `src/socket.js` — no changes
- `src/context/AuthContext.jsx` — no changes
- `src/App.jsx` — no changes (routing untouched)
- `src/components/MenuImportModal.jsx` — update styling only if it appears on-screen during MenuPage work

### Constraints

- No logic changes: API calls, state hooks, event handlers stay identical
- No new pages or routes
- No new dependencies except Vitest + RTL for testing
- Spanish UI copy stays as-is

---

## Testing

### Setup

Add to `package.json` dev dependencies:
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jsdom`

Add `vitest.config.js` at project root.

Add `"test": "vitest"` to scripts.

### Test scope per page

For each page:
1. **Renders without crash** — component mounts with mocked API
2. **Key elements visible** — headings, form fields, buttons present
3. **Form submit** — triggers the correct `api.*` call with correct args

For `ui.jsx` primitives:
- Snapshot test per component
- Behavior tests: Toggle fires onChange, Button fires onClick, SaveBar shows "Guardado" after save

### Test location

`src/__tests__/` — one file per page/component (`LoginPage.test.jsx`, `ui.test.jsx`, etc.)

---

## Implementation Order

1. Generate 5 missing Stitch screens (MCP calls, review each)
2. Update `src/index.css` — add token CSS vars + font imports
3. Update `src/components/ui.jsx` — primitives to Cerulean Sentinel
4. Update `src/components/Layout.jsx` — sidebar
5. Install Vitest + RTL, configure
6. Per page (TDD): write test → implement → verify
   - LoginPage → OrdersPage → ConversationsPage → RestaurantPage → BotPage → HoursPage → MenuPage → SpecialsPage → PaymentPage
7. Run `npm run dev`, visual check all 9 pages in browser

---

## Verification

```bash
# Tests pass
npm run test

# Build succeeds
npm run build

# Lint clean
npm run lint

# Visual: dev server up, manually walk all 9 pages
npm run dev
```

Spot-check per page: correct colors, fonts, layout matches Stitch design, all existing interactions still work (form saves, drag-and-drop in Orders, chat in Conversations).
