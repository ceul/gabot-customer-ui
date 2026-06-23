# Meta Credentials Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Meta Credentials card to BotPage that lets a restaurant owner store `phone_number_id`, `waba_id`, and `meta_access_token` per restaurant, backed by a dedicated API endpoint.

**Architecture:** New Flask blueprint `/api/restaurant/meta-credentials` (GET returns `has_token: bool`, never the raw token; PUT writes all three fields, skips token overwrite if payload field is empty). Self-contained `MetaCredentialsCard` React component dropped into BotPage, with its own fetch/save cycle independent of bot personality settings.

**Tech Stack:** Flask 3 + SQLAlchemy 2 (backend), pytest + pytest-flask + SQLite in-memory (backend tests), React 19 + react-hook-form + @testing-library/react + vitest (frontend).

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `gabot-backend/utils/db.py` | Add `meta_access_token` column to `Restaurant` model |
| Modify | `gabot-backend/db/init.db` | Idempotent `ALTER TABLE` for existing DBs |
| Create | `gabot-backend/controllers/meta_credentials_routes.py` | GET + PUT `/api/restaurant/meta-credentials` |
| Modify | `gabot-backend/app.py` | Import + register `meta_credentials_bp` |
| Create | `gabot-backend/tests/test_meta_credentials_routes.py` | Endpoint tests (TDD — write before implementation) |
| Modify | `gabot-customer-ui/src/api.js` | Add `metaCredentials` namespace |
| Create | `gabot-customer-ui/src/components/MetaCredentialsCard.jsx` | Self-contained card with own fetch/save state |
| Create | `gabot-customer-ui/src/__tests__/MetaCredentialsCard.test.jsx` | Component tests (TDD — write before implementation) |
| Modify | `gabot-customer-ui/src/pages/BotPage.jsx` | Import and render `<MetaCredentialsCard />` |

---

## Task 1: Add `meta_access_token` to the Restaurant DB model

**Files:**
- Modify: `gabot-backend/utils/db.py`
- Modify: `gabot-backend/db/init.db`
- Test: `gabot-backend/tests/test_db_schema.py` (append to existing file)

- [ ] **Step 1: Write the failing test**

Append to `gabot-backend/tests/test_db_schema.py`:

```python
def test_restaurant_has_meta_access_token_column(mem_session):
    r = Restaurant(waba_id="w_meta", phone_number_id="p_meta", name="R_meta", owner_whatsapp="+3")
    mem_session.add(r)
    mem_session.commit()
    assert r.meta_access_token is None

    r.meta_access_token = "EAAtest123"
    mem_session.commit()

    fetched = mem_session.query(Restaurant).filter_by(waba_id="w_meta").first()
    assert fetched.meta_access_token == "EAAtest123"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd gabot-backend && pytest tests/test_db_schema.py::test_restaurant_has_meta_access_token_column -v
```

Expected: `FAILED` — `AttributeError: type object 'Restaurant' has no attribute 'meta_access_token'`

- [ ] **Step 3: Add column to Restaurant model**

In `gabot-backend/utils/db.py`, locate the `Restaurant` class (around line 60). Add after the `phone_number_id` column:

```python
meta_access_token = Column(Text, nullable=True)
```

Ensure `Text` is imported — it is already used elsewhere in the file. If not, add it to the SQLAlchemy import line.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd gabot-backend && pytest tests/test_db_schema.py::test_restaurant_has_meta_access_token_column -v
```

Expected: `PASSED`

- [ ] **Step 5: Add idempotent migration to init.db**

In `gabot-backend/db/init.db`, append before the final line (or at the end of the file):

```sql
-- Add per-restaurant Meta access token (phase 0: plaintext; encrypt before phase 2)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS meta_access_token TEXT;
```

- [ ] **Step 6: Commit**

```bash
cd gabot-backend
git add utils/db.py db/init.db tests/test_db_schema.py
git commit -m "feat: add meta_access_token column to restaurants table"
```

---

## Task 2: Backend endpoint — `GET` and `PUT /api/restaurant/meta-credentials`

**Files:**
- Create: `gabot-backend/tests/test_meta_credentials_routes.py`
- Create: `gabot-backend/controllers/meta_credentials_routes.py`
- Modify: `gabot-backend/app.py`

- [ ] **Step 1: Write the failing tests**

Create `gabot-backend/tests/test_meta_credentials_routes.py`:

```python
"""Tests for GET/PUT /api/restaurant/meta-credentials."""


def test_get_meta_credentials_unauthenticated(client):
    rv = client.get("/api/restaurant/meta-credentials")
    assert rv.status_code == 401


def test_get_meta_credentials_defaults(client, auth_headers):
    headers, _ = auth_headers
    rv = client.get("/api/restaurant/meta-credentials", headers=headers)
    assert rv.status_code == 200
    data = rv.get_json()
    assert "phone_number_id" in data
    assert "waba_id" in data
    assert "has_token" in data
    assert "meta_access_token" not in data


def test_get_meta_credentials_has_token_false_initially(client, auth_headers):
    headers, _ = auth_headers
    rv = client.get("/api/restaurant/meta-credentials", headers=headers)
    assert rv.get_json()["has_token"] is False


def test_put_meta_credentials_saves_all_fields(client, auth_headers):
    headers, _ = auth_headers
    rv = client.put(
        "/api/restaurant/meta-credentials",
        json={
            "phone_number_id": "111222333",
            "waba_id": "444555666",
            "meta_access_token": "EAAtest999",
        },
        headers=headers,
    )
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["phone_number_id"] == "111222333"
    assert data["waba_id"] == "444555666"
    assert data["has_token"] is True
    assert "meta_access_token" not in data


def test_put_meta_credentials_does_not_clear_token_on_empty_string(client, auth_headers):
    headers, _ = auth_headers
    # First: save a token
    client.put(
        "/api/restaurant/meta-credentials",
        json={"phone_number_id": "111", "waba_id": "222", "meta_access_token": "EAAreal"},
        headers=headers,
    )
    # Second: PUT without token (empty string)
    rv = client.put(
        "/api/restaurant/meta-credentials",
        json={"phone_number_id": "333", "waba_id": "444", "meta_access_token": ""},
        headers=headers,
    )
    assert rv.status_code == 200
    assert rv.get_json()["has_token"] is True  # token not cleared


def test_put_meta_credentials_unauthenticated(client):
    rv = client.put("/api/restaurant/meta-credentials", json={})
    assert rv.status_code == 401
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd gabot-backend && pytest tests/test_meta_credentials_routes.py -v
```

Expected: All `FAILED` — `404 NOT FOUND` (endpoint doesn't exist yet)

- [ ] **Step 3: Create the blueprint**

Create `gabot-backend/controllers/meta_credentials_routes.py`:

```python
"""Meta credentials blueprint — per-restaurant WhatsApp API credentials."""
import utils.db as _db
from flask import Blueprint, g, jsonify, request
from utils.auth import require_auth
from utils.db import Restaurant

meta_credentials_bp = Blueprint(
    "meta_credentials", __name__, url_prefix="/api/restaurant"
)


@meta_credentials_bp.route("/meta-credentials", methods=["GET"])
@require_auth
def get_meta_credentials():
    with _db.SessionLocal() as session:
        r = session.get(Restaurant, g.restaurant_id)
        if not r:
            return jsonify({"error": "Restaurant not found"}), 404
        return jsonify(_serialize(r)), 200


@meta_credentials_bp.route("/meta-credentials", methods=["PUT"])
@require_auth
def put_meta_credentials():
    data = request.get_json(silent=True) or {}
    with _db.SessionLocal() as session:
        r = session.get(Restaurant, g.restaurant_id)
        if not r:
            return jsonify({"error": "Restaurant not found"}), 404
        if "phone_number_id" in data:
            r.phone_number_id = data["phone_number_id"]
        if "waba_id" in data:
            r.waba_id = data["waba_id"]
        token = data.get("meta_access_token", "")
        if token:
            r.meta_access_token = token
        session.commit()
        session.refresh(r)
        return jsonify(_serialize(r)), 200


def _serialize(r: Restaurant) -> dict:
    return {
        "phone_number_id": r.phone_number_id,
        "waba_id": r.waba_id,
        "has_token": bool(r.meta_access_token),
    }
```

- [ ] **Step 4: Register blueprint in app.py**

In `gabot-backend/app.py`, add after the existing imports (around line 27):

```python
from controllers.meta_credentials_routes import meta_credentials_bp
```

Add after the existing `app.register_blueprint(menu_bp)` line:

```python
app.register_blueprint(meta_credentials_bp)
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd gabot-backend && pytest tests/test_meta_credentials_routes.py -v
```

Expected: All `PASSED`

- [ ] **Step 6: Run the full test suite to confirm no regressions**

```bash
cd gabot-backend && pytest --tb=short -q
```

Expected: All previously passing tests still pass.

- [ ] **Step 7: Commit**

```bash
cd gabot-backend
git add controllers/meta_credentials_routes.py app.py tests/test_meta_credentials_routes.py
git commit -m "feat: add GET/PUT /api/restaurant/meta-credentials endpoint"
```

---

## Task 3: Add `metaCredentials` namespace to frontend api.js

**Files:**
- Modify: `gabot-customer-ui/src/api.js`

No isolated unit test for api.js — the component tests in Task 4 mock this namespace and validate the contract indirectly.

- [ ] **Step 1: Add the namespace**

In `gabot-customer-ui/src/api.js`, append at the end of the file:

```js
export const metaCredentials = {
  get:    ()     => api.get('/restaurant/meta-credentials').then(r => r.data),
  update: (data) => api.put('/restaurant/meta-credentials', data).then(r => r.data),
}
```

- [ ] **Step 2: Commit**

```bash
cd gabot-customer-ui
git add src/api.js
git commit -m "feat: add metaCredentials api namespace"
```

---

## Task 4: MetaCredentialsCard component (TDD)

**Files:**
- Create: `gabot-customer-ui/src/__tests__/MetaCredentialsCard.test.jsx`
- Create: `gabot-customer-ui/src/components/MetaCredentialsCard.jsx`

- [ ] **Step 1: Write the failing tests**

Create `gabot-customer-ui/src/__tests__/MetaCredentialsCard.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MetaCredentialsCard from '../components/MetaCredentialsCard'

vi.mock('../api', () => ({
  metaCredentials: {
    get: vi.fn(),
    update: vi.fn(),
  },
}))

import { metaCredentials as api } from '../api'

const renderCard = () =>
  render(<MemoryRouter><MetaCredentialsCard /></MemoryRouter>)

describe('MetaCredentialsCard', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the card heading', async () => {
    api.get.mockResolvedValue({ phone_number_id: '', waba_id: '', has_token: false })
    renderCard()
    await waitFor(() => {
      expect(screen.getByText(/credenciales de whatsapp/i)).toBeInTheDocument()
    })
  })

  it('loads phone_number_id and waba_id into fields', async () => {
    api.get.mockResolvedValue({ phone_number_id: '111222', waba_id: '333444', has_token: false })
    renderCard()
    await waitFor(() => {
      expect(screen.getByDisplayValue('111222')).toBeInTheDocument()
      expect(screen.getByDisplayValue('333444')).toBeInTheDocument()
    })
  })

  it('shows masked placeholder for token when has_token is true', async () => {
    api.get.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true })
    renderCard()
    await waitFor(() => {
      expect(screen.getByText(/token guardado/i)).toBeInTheDocument()
    })
  })

  it('token field is always type=password', async () => {
    api.get.mockResolvedValue({ phone_number_id: '', waba_id: '', has_token: false })
    renderCard()
    await waitFor(() => {
      const tokenInput = screen.getByPlaceholderText(/•••/i)
      expect(tokenInput).toHaveAttribute('type', 'password')
    })
  })

  it('shows green badge when all credentials are present', async () => {
    api.get.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true })
    renderCard()
    await waitFor(() => {
      expect(screen.getByText(/credenciales configuradas/i)).toBeInTheDocument()
    })
  })

  it('shows warning badge when credentials are incomplete', async () => {
    api.get.mockResolvedValue({ phone_number_id: '', waba_id: '', has_token: false })
    renderCard()
    await waitFor(() => {
      expect(screen.getByText(/credenciales incompletas/i)).toBeInTheDocument()
    })
  })

  it('omits token from payload when token field is empty', async () => {
    api.get.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true })
    api.update.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true })
    renderCard()
    await waitFor(() => screen.getByText(/guardar/i))

    fireEvent.click(screen.getByText(/guardar credenciales/i))
    await waitFor(() => {
      expect(api.update).toHaveBeenCalledWith(
        expect.not.objectContaining({ meta_access_token: expect.anything() })
      )
    })
  })

  it('includes token in payload when token field is filled', async () => {
    const user = userEvent.setup()
    api.get.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: false })
    api.update.mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true })
    renderCard()
    await waitFor(() => screen.getByPlaceholderText(/•••/i))

    await user.type(screen.getByPlaceholderText(/•••/i), 'EAANewToken')
    fireEvent.click(screen.getByText(/guardar credenciales/i))
    await waitFor(() => {
      expect(api.update).toHaveBeenCalledWith(
        expect.objectContaining({ meta_access_token: 'EAANewToken' })
      )
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd gabot-customer-ui && npx vitest run src/__tests__/MetaCredentialsCard.test.jsx
```

Expected: All `FAIL` — `Cannot find module '../components/MetaCredentialsCard'`

- [ ] **Step 3: Create the component**

Create `gabot-customer-ui/src/components/MetaCredentialsCard.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { metaCredentials as api } from '../api'
import { Card, Field, Input, Button, ErrorMsg } from './ui'

const DEFAULTS = { phone_number_id: '', waba_id: '', meta_access_token: '' }

export default function MetaCredentialsCard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: DEFAULTS })

  useEffect(() => {
    api.get()
      .then(data => {
        reset({ phone_number_id: data.phone_number_id || '', waba_id: data.waba_id || '', meta_access_token: '' })
        setHasToken(!!data.has_token)
      })
      .catch(() => setError('No se pudo cargar las credenciales.'))
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (data) => {
    setError(null); setSaved(false)
    const payload = {
      phone_number_id: data.phone_number_id,
      waba_id: data.waba_id,
    }
    if (data.meta_access_token) {
      payload.meta_access_token = data.meta_access_token
    }
    try {
      const updated = await api.update(payload)
      reset({ phone_number_id: updated.phone_number_id || '', waba_id: updated.waba_id || '', meta_access_token: '' })
      setHasToken(!!updated.has_token)
      setSaved(true)
    } catch {
      setError('Error al guardar las credenciales.')
    }
  }

  const isComplete = hasToken && !loading

  if (loading) return null

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-semibold text-on-surface">Credenciales de WhatsApp (Meta)</h3>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">REQUERIDO</span>
      </div>
      <p className="text-xs text-on-surface-muted mb-4">
        Obtén estos valores en Meta Business Manager → Sistema de usuarios → Token de acceso.
      </p>

      {error && <div className="mb-3"><ErrorMsg message={error} /></div>}

      <div className="space-y-3">
        <Field label="Phone Number ID" hint="ID numérico del número de WhatsApp">
          <Input {...register('phone_number_id')} placeholder="123456789012345" />
        </Field>

        <Field label="WhatsApp Business Account ID (WABA ID)" hint="ID de la cuenta WABA">
          <Input {...register('waba_id')} placeholder="987654321098765" />
        </Field>

        <Field label="Token de acceso" hint="Token del sistema, permanente">
          <Input
            type="password"
            autoComplete="off"
            placeholder="•••••••••••••"
            {...register('meta_access_token')}
          />
          {hasToken && (
            <p className="text-xs text-on-surface-muted mt-1">
              Token guardado. Escribe un nuevo valor para reemplazarlo.
            </p>
          )}
        </Field>
      </div>

      <div className={`mt-4 px-3 py-2 rounded text-xs font-medium flex items-center gap-2 ${
        isComplete
          ? 'bg-green-50 text-green-800 border-l-4 border-green-500'
          : 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400'
      }`}>
        {isComplete ? '✓ Credenciales configuradas — el bot puede enviar y recibir mensajes'
                    : '⚠ Credenciales incompletas — el bot no puede enviar mensajes'}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar credenciales'}
        </Button>
        {saved && <span className="text-xs text-primary font-medium">¡Guardado!</span>}
      </div>
    </Card>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd gabot-customer-ui && npx vitest run src/__tests__/MetaCredentialsCard.test.jsx
```

Expected: All `PASS`

- [ ] **Step 5: Commit**

```bash
cd gabot-customer-ui
git add src/components/MetaCredentialsCard.jsx src/__tests__/MetaCredentialsCard.test.jsx
git commit -m "feat: add MetaCredentialsCard component with tests"
```

---

## Task 5: Integrate MetaCredentialsCard into BotPage

**Files:**
- Modify: `gabot-customer-ui/src/__tests__/BotPage.test.jsx`
- Modify: `gabot-customer-ui/src/pages/BotPage.jsx`

- [ ] **Step 1: Write the failing test**

In `gabot-customer-ui/src/__tests__/BotPage.test.jsx`, add to the existing mock block and add a test:

Add to the `vi.mock('../api', ...)` factory (merge into the existing object):

```js
vi.mock('../api', () => ({
  bot: {
    get: vi.fn().mockResolvedValue({
      bot_name: 'Gabot',
      language: 'es',
      tone: 'friendly',
      personality: 'Asistente amigable',
      greeting: 'Hola!',
      notify_on_status_change: true,
    }),
    update: vi.fn().mockResolvedValue({}),
  },
  metaCredentials: {
    get: vi.fn().mockResolvedValue({ phone_number_id: '111', waba_id: '222', has_token: true }),
    update: vi.fn().mockResolvedValue({}),
  },
}))
```

Add test:

```js
it('renders the Meta credentials section', async () => {
  render(<MemoryRouter><BotPage /></MemoryRouter>)
  await waitFor(() => {
    expect(screen.getByText(/credenciales de whatsapp/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd gabot-customer-ui && npx vitest run src/__tests__/BotPage.test.jsx
```

Expected: New test `FAIL` — "credenciales de whatsapp" not found. Existing tests still pass.

- [ ] **Step 3: Add MetaCredentialsCard to BotPage**

In `gabot-customer-ui/src/pages/BotPage.jsx`, add the import after the existing imports:

```js
import MetaCredentialsCard from '../components/MetaCredentialsCard'
```

Add `<MetaCredentialsCard />` inside the `<div className="space-y-4">`, after the Notificaciones `<Card>` and before `</div>`:

```jsx
<Card>
  <h3 className="text-sm font-semibold text-on-surface mb-4">Notificaciones</h3>
  <Toggle
    checked={notifyEnabled}
    onChange={setNotifyEnabled}
    label="Notificar al cliente por WhatsApp al cambiar el estado del pedido"
  />
</Card>

<MetaCredentialsCard />   {/* ← add this line */}
```

- [ ] **Step 4: Run all frontend tests to verify everything passes**

```bash
cd gabot-customer-ui && npx vitest run
```

Expected: All `PASS`

- [ ] **Step 5: Commit**

```bash
cd gabot-customer-ui
git add src/pages/BotPage.jsx src/__tests__/BotPage.test.jsx
git commit -m "feat: integrate MetaCredentialsCard into BotPage"
```

---

## Phase 1 Note — Token Encryption

Before onboarding paying restaurants, encrypt `meta_access_token` at rest. Two options:

1. **`pgcrypto` (PostgreSQL):** `pgp_sym_encrypt(token, key)` / `pgp_sym_decrypt(token, key)`. Encryption at the DB layer, key in Vault/env var.
2. **Application-level AES-256:** Python `cryptography` library, `Fernet(key).encrypt(token.encode())` before write, `.decrypt()` before use. Easier to test, key in Vault.

Option 2 is recommended — easier to unit test and portable across DB engines. Wire the encryption key through GitHub Secrets → Vault before Phase 1 launch.
