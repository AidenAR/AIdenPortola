# Portola Ops Dashboard

Internal operations dashboard for monitoring and managing stablecoin settlements.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

### Phase 1 — MVP
- 50 mock transactions with realistic weighted distribution (70% retail, 30% institutional)
- Sortable table with status badges, currency formatting, and timestamps
- "Clear Funds" button with pessimistic UI (Processing... → Cleared)

### Phase 2 — Compliance
- High-value transactions (>$10k) flagged with red row tint + ⚠ icon
- Clear Funds locked on high-value rows unless Super Admin is ON
- Super Admin toggle in the navigation bar

### Phase 3 — Live Fire
- New transaction streamed every 2 seconds via recursive `setTimeout`
- Buffered banner pattern (Twitter/X style) — rows never shift during user actions
- Merge disabled while any clear operation is in flight
- Buffer capped at 100 items

### Phase 4 — Batch Settlement
- Checkbox selection with "Select All" (respects compliance locks)
- Sticky batch toolbar with "Clear Selected" action
- 10% random failure rate on clear operations
- `Promise.all` with catch-per-promise for independent resolution
- Summary toast on batch completion ("9 cleared, 1 failed — retry?")

## Architecture

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **State**: `useReducer` with typed actions — no external state management
- **Key pattern**: Per-transaction `op` field + `attempt` token for concurrency safety

## Trade-offs

- **Pessimistic UI** for clear operations — accuracy over perceived speed in financial ops
- **Client-side Super Admin toggle** — in production this would be server-enforced RBAC
- **Hand-rolled table** instead of TanStack Table — appropriate for ≤100 rows
- **Recursive setTimeout** over setInterval — prevents callback backlog after tab throttling

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Inter font
│   ├── page.tsx            # Dashboard — top-level state owner
│   └── globals.css         # Tailwind + custom animations
├── components/
│   ├── NavBar.tsx           
│   ├── SuperAdminToggle.tsx 
│   ├── NewTransactionsBanner.tsx
│   ├── BatchToolbar.tsx     
│   ├── TransactionTable.tsx 
│   ├── StatusBadge.tsx      
│   ├── ClearButton.tsx      
│   └── Toast.tsx            
├── lib/
│   ├── types.ts            # Transaction, DashboardState
│   ├── eligibility.ts      # Pure predicates: canClear, canSelect, isTableStable
│   ├── generateTransactions.ts
│   ├── mockApi.ts          # mockClearFunds with configurable failureRate
│   └── reducer.ts          # All state transitions + attempt guards
└── hooks/
    └── useLiveFeed.ts      # Recursive setTimeout feed
```
