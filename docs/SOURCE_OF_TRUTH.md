# Holly Buddy — Source of Truth Register

This register is the canonical implementation checkpoint for the foundation. It records ownership and write boundaries before feature expansion.

## Authority hierarchy

1. Master Blueprint V3 — supreme functional and architectural source.
2. PDF 00 — normative overrides for PDFs 01–100, without contradicting the Master Blueprint.
3. PDF 42.5 — architecture lock, source-of-truth and dependency governance.
4. PDFs 01–100 — implementation requirements subject to the higher layers.
5. UI/UX — projection only; never a source of truth.

## Canonical domain ownership

| Domain | Canonical owner | Write boundary | Notes |
|---|---:|---|---|
| Identity / Authentication | 90 | Domain API / authorized command | Auth/session truth |
| Authorization / Security Policy | 53 | Domain API / policy enforcement | RLS, RBAC, ABAC and security policy |
| Organization / Tenant / Membership | 89 | Domain API / authorized command | Organization context |
| Booking | 62 | Booking commands/API | Canonical booking state |
| Availability / Capacity | 64 | Availability commands/API | Never booking truth |
| Pricing / Quotes / Promotions | 87 | Pricing commands/API | Consumes/validates commercial state |
| Payment / Finance / Ledger | 61 | Finance commands/API | Unique financial truth |
| CRM / Customer 360 | 41 | CRM commands/API | Canonical customer truth |
| Messaging / Conversations | 60 | Messaging commands/API | Message/conversation truth |
| Notifications / Delivery | 97 | Notification commands/API | Delivery engine |
| Realtime / Sync | 98 | Realtime transport/API | Transport/sync only; domains own state |
| Reviews / Reputation | 86 | Review commands/API | Consolidates legacy review engines |
| Search / Retrieval | 94 | Search/retrieval API | Derived/rebuildable; domain remains truth |
| Content / Editorial | 83 | Content API | Editorial semantics |
| Files / Storage | 96 | Storage API | File/storage mechanics |
| Workflow semantics | 38 | Workflow commands/API | Business workflow authority |
| Durable Events | 92 | Event publication boundary | One event bus |
| Async Runtime | 93 | Job dispatcher/worker | One async runtime |
| API / Webhook Gateway | 91 | API gateway/contracts | External adapter abstraction remains downstream |
| Reliability / Observability / DR | 54 | Reliability/operations boundary | Cross-cutting |
| Policy / Change Governance | 79 | Governance commands/API | Policy/change lifecycle |
| Audit / Evidence | 80 | Authorized audit handlers | Evidence, not business truth |
| AI Orchestration | 95 | AI orchestration boundary | Uses canonical retrieval/domain tools |
| Operator Control Plane | 99 | Operator commands | No business-truth ownership |

## Platform engine uniqueness

- One workflow engine: 38 + governed extensions.
- One event bus: 92.
- One async runtime: 93.
- One realtime layer: 98.
- One notification engine: 97.
- One search/retrieval engine: 94.
- One financial truth: 61.
- One review engine: 86.
- One identity layer: 90.
- One API contract layer: 91.
- One control plane: 99.
- One audit trail: 80.

## Cross-domain rules

- No domain-specific table, service, frontend store, or integration becomes canonical without an explicit owner and write boundary.
- Domains must not write directly to another domain's tables.
- Commands are authorized requests for action; events are immutable facts that already occurred.
- Realtime transport is never canonical business state.
- Search indexes are derived; the domain remains the source of truth.
- Legacy components may remain readable during migration, but must not retain competing write authority.
- Tenant isolation and authorization are enforced server-side.
- State transitions are explicit and invalid transitions are rejected.
- Secrets and environment-specific configuration are never committed.

## Conflict handling

If two documents or implementations claim competing ownership, stop the affected implementation and record the conflict as a BLOCKER. Do not choose an owner implicitly.

If the Master Blueprint V3 appears to conflict with PDF 00, the conflict must be surfaced as a BLOCKER rather than silently resolved.

## Foundation status

This file locks architecture and ownership only. It does not create domain tables, migrations, fake business data, or feature implementations.
