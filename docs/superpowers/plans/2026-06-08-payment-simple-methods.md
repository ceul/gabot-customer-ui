# Payment Simple Methods — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Always show Efectivo, Tarjeta de crédito, and Tarjeta débito toggles on the Payment page, regardless of whether the backend has seeded those records.

**Architecture:** Hardcode the three simple method types as frontend constants. On load, merge API response with a synthetic default `{ id: null, is_enabled: false }` for any missing type. Toggle handler calls `create` when id is null, `update` when id exists.

**Tech Stack:** React 19, Vitest, @testing-library/react, @testing-library/user-event

---

### Task 1: Add failing tests for missing-record behaviour

**Files:**
- Modify: `src/__tests__/PaymentPage.test.jsx`

- [ ] **Step 1: Add test — all 3 simple methods render when API returns empty array**

Add inside the existing `describe('PaymentPage')` block:

```js
it('renders all three simple methods even when API returns empty array', async () => {
  const { paymentMethods } = await import('../api')
  paymentMethods.get.mockResolvedValueOnce([])
  render(<MemoryRouter><PaymentPage /></MemoryRouter>)
  await waitFor(() => {
    expect(screen.getByText(/efectivo/i)).toBeInTheDocument()
    expect(screen.getByText(/tarjeta de crédito/i)).toBeInTheDocument()
    expect(screen.getByText(/tarjeta débito/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Add test — toggling a method with no record calls `create`, not `update`**

Add `userEvent` import at top of the test file:

```js
import userEvent from '@testing-library/user-event'
```

Then add the test inside the same `describe` block:

```js
it('calls create when toggling a method with no existing record', async () => {
  const user = userEvent.setup()
  const { paymentMethods } = await import('../api')
  paymentMethods.get.mockResolvedValueOnce([])
  paymentMethods.create.mockResolvedValueOnce({ id: 99, method_type: 'cash', is_enabled: true })

  render(<MemoryRouter><PaymentPage /></MemoryRouter>)
  await waitFor(() => expect(screen.getByText(/efectivo/i)).toBeInTheDocument())

  // First 'Deshabilitado' label belongs to cash (first in SIMPLE_TYPES order)
  const toggleLabel = screen.getAllByText(/deshabilitado/i)[0].closest('label')
  await user.click(toggleLabel)

  await waitFor(() =>
    expect(paymentMethods.create).toHaveBeenCalledWith({ method_type: 'cash', is_enabled: true })
  )
})
```

- [ ] **Step 3: Run tests — verify both new tests fail**

```bash
cd /home/ceul/Documentos/gabot/gabot-customer-ui
npm run test:run -- --reporter=verbose src/__tests__/PaymentPage.test.jsx
```

Expected: the two new tests fail. Existing tests pass.

---

### Task 2: Implement the merge logic and updated toggle handler

**Files:**
- Modify: `src/pages/PaymentPage.jsx`

- [ ] **Step 1: Add `SIMPLE_TYPES` constant after the existing `SIMPLE_LABELS` constant**

Current code (around line 10):
```js
const SIMPLE_LABELS = {
  cash:        'Efectivo',
  credit_card: 'Tarjeta de crédito',
  debit_card:  'Tarjeta débito',
}
```

Add after it:
```js
const SIMPLE_TYPES = ['cash', 'credit_card', 'debit_card']
```

- [ ] **Step 2: Update `SimpleMethodCard` to pass the full method object to `onToggle`**

Current:
```js
const handleToggle = async (val) => {
  setSaving(true)
  await onToggle(method.id, val)
  setSaving(false)
}
```

Replace with:
```js
const handleToggle = async (val) => {
  setSaving(true)
  await onToggle(method, val)
  setSaving(false)
}
```

- [ ] **Step 3: Replace `handleToggle` in `PaymentPage` to handle null id**

Current:
```js
const handleToggle = async (id, is_enabled) => {
  const updated = await api.update(id, { is_enabled })
  setMethods(prev => prev.map(m => m.id === id ? updated : m))
}
```

Replace with:
```js
const handleToggle = async (method, is_enabled) => {
  if (method.id === null) {
    const created = await api.create({ method_type: method.method_type, is_enabled })
    setMethods(prev => [...prev, created])
  } else {
    const updated = await api.update(method.id, { is_enabled })
    setMethods(prev => prev.map(m => m.id === method.id ? updated : m))
  }
}
```

- [ ] **Step 4: Replace `simpleMethods` derivation with the merge logic**

Current (near bottom of `PaymentPage`):
```js
const simpleMethods = methods.filter(m => ['cash', 'credit_card', 'debit_card'].includes(m.method_type))
```

Replace with:
```js
const apiMap = Object.fromEntries(
  methods
    .filter(m => SIMPLE_TYPES.includes(m.method_type))
    .map(m => [m.method_type, m])
)
const simpleMethods = SIMPLE_TYPES.map(type => apiMap[type] ?? { id: null, method_type: type, is_enabled: false })
```

- [ ] **Step 5: Update the key on `SimpleMethodCard` in JSX**

Current:
```jsx
{simpleMethods.map(m => (
  <SimpleMethodCard key={m.id} method={m} onToggle={handleToggle} />
))}
```

Replace with:
```jsx
{simpleMethods.map(m => (
  <SimpleMethodCard key={m.method_type} method={m} onToggle={handleToggle} />
))}
```

(Use `method_type` as key — synthetic records have `id: null`, making `id` a bad key.)

---

### Task 3: Run all tests and commit

- [ ] **Step 1: Run the full PaymentPage test suite**

```bash
cd /home/ceul/Documentos/gabot/gabot-customer-ui
npm run test:run -- --reporter=verbose src/__tests__/PaymentPage.test.jsx
```

Expected: all tests pass including the two new ones.

- [ ] **Step 2: Run full test suite to check for regressions**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
cd /home/ceul/Documentos/gabot/gabot-customer-ui
git add src/pages/PaymentPage.jsx src/__tests__/PaymentPage.test.jsx
git commit -m "feat(payment): always show simple payment method toggles regardless of backend seeding"
```
