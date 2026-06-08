# Payment Page — Fixed Simple Methods

## Problem

The "Métodos Simples" section is empty because the backend doesn't always seed the three base payment method records on restaurant creation. The UI depends on those records existing.

## Solution

Hardcode the three simple method types as frontend constants. Merge with API response on load. Handle missing records gracefully with a synthetic default.

## Data Flow

```
SIMPLE_TYPES = [cash, credit_card, debit_card]
  ↓
API GET /payment-methods → returned records
  ↓
merge: for each type, use returned record or synthetic { id: null, is_enabled: false }
  ↓
Always renders all 3 toggle cards
  ↓
Toggle:
  id === null → POST /payment-methods (create, then update local state with new id)
  id !== null → PUT /payment-methods/:id (update)
```

## Components Changed

- `PaymentPage.jsx` — `simpleMethods` derived from merge, not raw filter
- `SimpleMethodCard` — receives `onCreate` in addition to `onToggle` to handle null-id case

## Out of Scope

- Nequi, Daviplata, Bre-B (Phase 1)
- Backend seeding fix (deferred)
- Comprobante flow (Phase 1)
