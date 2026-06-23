# Design: Meta Credentials Card — BotPage

Date: 2026-06-08
Status: APPROVED

## Problem

Each restaurant needs its own WhatsApp phone number and Meta access token. The current `get_meta_api()` reads a single global `META_ACCESS_TOKEN` env var — breaks for restaurant #2. There is no UI for restaurant owners to enter their own Meta credentials.

## Scope

New Card on `BotPage.jsx` (below "Notificaciones") that lets a restaurant owner store the three Meta credentials required to operate their WhatsApp number. Backed by a new dedicated API endpoint. Separate save state from bot personality settings.

## Fields

| Field | DB column | Type | Display after save |
|---|---|---|---|
| Phone Number ID | `restaurants.phone_number_id` | TEXT | plain value |
| WABA ID | `restaurants.waba_id` | TEXT | plain value |
| Token de acceso | `restaurants.meta_access_token` | TEXT | always masked `•••` |

Token masking rule: after a token is saved, the input renders as a password field with placeholder `•••••••••••••`. A hint below reads "Token guardado. Escribe un nuevo valor para reemplazarlo." Submitting an empty token field leaves the existing DB value unchanged.

Status badge below the fields:
- Green "✓ Credenciales configuradas" — all three fields present
- Yellow "⚠ Credenciales incompletas" — any field missing

## Backend

### New endpoint: `/api/restaurant/meta-credentials`

**`GET /api/restaurant/meta-credentials`**
- Auth: `@require_auth` (JWT, same as all endpoints)
- Returns:
  ```json
  { "phone_number_id": "123…", "waba_id": "987…", "has_token": true }
  ```
- `meta_access_token` is **never** returned in any response.

**`PUT /api/restaurant/meta-credentials`**
- Auth: `@require_auth`
- Accepts:
  ```json
  { "phone_number_id": "123…", "waba_id": "987…", "meta_access_token": "EAAx…" }
  ```
- If `meta_access_token` is absent or empty string → keep existing DB value (no overwrite).
- Updates `restaurants` row for `g.restaurant_id`.
- Returns same shape as GET.

### New blueprint file

`gabot-backend/controllers/meta_credentials_routes.py` — registered as `meta_credentials_bp` with prefix `/api/restaurant`.

## Database

`restaurants` table already has `phone_number_id` and `waba_id`.

Add column:
```sql
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS meta_access_token TEXT;
```

Add to `gabot-backend/db/init.db` (idempotent, `IF NOT EXISTS`).

### Token security

| Phase | Storage |
|---|---|
| Phase 0 | Plaintext `TEXT` column in PostgreSQL — acceptable for single pilot restaurant |
| Phase 1 | Encrypt at rest before onboarding paying restaurants. Options: `pgcrypto` symmetric encryption or application-level AES-256 via Python `cryptography` library. Key stored in Vault (or GitHub Secret until Vault migration). |

## Frontend

### api.js

New `metaCredentials` namespace:
```js
metaCredentials: {
  get:    ()     => api.get('/api/restaurant/meta-credentials').then(r => r.data),
  update: (data) => api.put('/api/restaurant/meta-credentials', data).then(r => r.data),
}
```

### MetaCredentialsCard component

New file: `gabot-customer-ui/src/components/MetaCredentialsCard.jsx`

- Self-contained: owns its own `useEffect` (fetch on mount), `onSubmit`, loading/error/saved state.
- Uses `react-hook-form`. Fields: `phone_number_id`, `waba_id`, `meta_access_token`.
- `meta_access_token` field: `type="password"` always, `placeholder="•••••••••••••"`, `autoComplete="off"`.
- On load: if `has_token` is true, `meta_access_token` field shows placeholder only (no value).
- On submit: omit `meta_access_token` from payload if the field is empty.
- Own Save button (not shared with BotPage `SaveBar`) — button text "Guardar credenciales".
- Status badge computed from `has_token && phone_number_id && waba_id`.

### BotPage.jsx change

Import and drop `<MetaCredentialsCard />` below the `<Card>` for Notificaciones, before `<SaveBar>`.

## What this is NOT

- No token validation call to Meta on save (phase 0 — add in phase 1 health check)
- No Embedded Signup / OAuth flow — that is phase 1 (start Meta BSP verification now, parallel to phase 0)
- No encryption at rest — phase 1 requirement (see Token security table above)
- No token rotation UI — Meta permanent tokens don't expire; revocation is manual

## Success Criteria

- Restaurant owner can enter `phone_number_id`, `waba_id`, and `meta_access_token` via the UI
- Token is never returned by the API
- `GET /api/restaurant/meta-credentials` returns `has_token: true` after saving
- Worker picks up the per-restaurant token on next message (depends on `get_meta_api()` refactor — separate task)
- Submitting with an empty token field does not clear an existing saved token
