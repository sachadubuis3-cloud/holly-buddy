# Holly Buddy — Canonical System Registries

Foundation checkpoint derived from the Master Blueprint V3, PDF 00, PDF 42.5 and the existing architecture lock. This document is governance-only: no domain tables, migrations or feature implementation are introduced here.

## 1. Canonical Domain Registry

| Domain | Owner | Canonical responsibility |
|---|---:|---|
| Identity / Authentication | 90 | Authentication and session truth |
| Authorization / Security Policy | 53 | Permission and security policy |
| Organization / Tenant / Membership | 89 | Tenant and organization structure |
| Booking | 62 | Booking state |
| Availability / Capacity | 64 | Availability and capacity |
| Pricing / Quotes / Promotions | 87 | Pricing and commercial calculations |
| Payment / Finance / Ledger | 61 | Payment, ledger and financial truth |
| CRM / Customer 360 | 41 | Customer truth |
| Messaging / Conversations | 60 | Messages and conversations |
| Notifications / Delivery | 97 | Notification delivery |
| Realtime / Sync | 98 | Realtime transport and synchronization |
| Reviews / Reputation | 86 | Review and reputation truth |
| Search / Retrieval | 94 | Derived search and retrieval |
| Content / Editorial | 83 | Editorial/content semantics |
| Files / Storage | 96 | File and storage mechanics |
| Workflow semantics | 38 | Business workflow semantics |
| Durable Events | 92 | Durable event bus |
| Async Runtime | 93 | Jobs, workers and asynchronous execution |
| API / Webhook Gateway | 91 | API and webhook contracts |
| Reliability / Observability / DR | 54 | Reliability, observability and disaster recovery |
| Policy / Change Governance | 79 | Policy and change lifecycle |
| Audit / Evidence | 80 | Audit evidence |
| AI Orchestration | 95 | AI orchestration and governance |
| Operator Control Plane | 99 | Cross-domain operator commands; no business truth |

## 2. Source of Truth Matrix

| Concern | Source of truth | Rule |
|---|---|---|
| Global architecture | Master Blueprint V3 | Supreme authority |
| Normative corrections | PDF 00 | Applies to PDFs 01–100; cannot silently contradict Master Blueprint |
| Architecture/dependency governance | PDF 42.5 | Resolves governed overlaps below Master Blueprint |
| Identity | 90 | Canonical identity/session layer |
| Tenant / organization | 89 | Canonical organization context |
| Authorization | 53 | Server-side security policy |
| Booking state | 62 | Single booking state machine |
| Availability/capacity | 64 | Separate from booking truth |
| Pricing/commercial calculation | 87 | Does not become finance truth |
| Financial truth | 61 | Single ledger/financial owner |
| Customer 360 | 41 | Canonical customer truth |
| Messaging | 60 | Message/conversation truth |
| Notification delivery | 97 | Delivery engine |
| Realtime transport | 98 | Transport only; domain state wins |
| Reviews/reputation | 86 | Single review engine |
| Search/retrieval | 94 | Derived/rebuildable index; domain wins |
| Content semantics | 83 | Editorial truth |
| File/storage mechanics | 96 | Storage truth |
| Workflow semantics | 38 | Business workflow authority |
| Durable events | 92 | Immutable facts / event bus |
| Async execution | 93 | Worker/job runtime |
| API contracts | 91 | Domain API and webhook boundary |
| Audit evidence | 80 | Evidence, not business state |
| AI orchestration | 95 | Uses canonical domain tools and retrieval |
| Operator control | 99 | Commands only; no business truth ownership |

## 3. Database Ownership Matrix

The implementation must follow the domain owner. No cross-domain direct table writes are permitted.

| Data class | Writer | Consumers |
|---|---:|---|
| Identity/session data | 90 | Authorized services/UI |
| Tenant/membership data | 89 | Authorized domain services |
| Authorization policy | 53 | Server-side enforcement |
| Booking state | 62 | Authorized readers/services |
| Availability/capacity state | 64 | Booking/pricing/readers through contracts |
| Pricing/quote state | 87 | Authorized commercial flows |
| Financial ledger | 61 | Authorized finance flows; projections may read |
| Customer 360 | 41 | CRM-aware domains/services |
| Messages/conversations | 60 | Messaging clients and authorized services |
| Notification delivery state | 97 | Notification consumers/operations |
| Realtime transport state | 98 | Transport layer; never business truth |
| Reviews/reputation | 86 | Authorized readers/services |
| Search index | 94 | Search/retrieval only; derived |
| Editorial content | 83 | Content-aware services |
| Files/storage metadata | 96 | Storage/document services |
| Workflow state | 38 | Workflow/runtime consumers |
| Durable events | 92 | Authorized event consumers |
| Jobs/leases/runtime state | 93 | Worker/runtime services |
| Audit evidence | 80 | Authorized audit/operations readers |

## 4. API / Service Ownership Matrix

Every mutation crosses an explicit domain command/API boundary.

- Domain API owns domain commands.
- Query APIs provide authorized reads.
- Commands are validated requests for action.
- Events are published facts, not commands.
- DTOs are stable contracts.
- Direct cross-domain table access is prohibited.
- Service boundaries are enforced server-side.

## 5. Command Registry

Canonical command examples from the architecture lock:

| Command | Owner | Meaning |
|---|---:|---|
| BOOKING.CREATE | 62 | Request creation of a booking |
| PAYMENT.CAPTURE | 61 | Request capture/payment execution |
| MESSAGE.SEND | 60 / delivery via 97 | Request sending a message |
| LOYALTY.REDEEM | Loyalty domain | Request redemption; owner must remain the canonical loyalty domain |
| Operator cross-domain command | 99 → target owner | Operator request routed to the owning domain |

A command is never treated as proof that the action succeeded. The resulting fact is represented by an event/state transition.

## 6. Event Registry

Canonical examples:

| Event | Owner | Meaning |
|---|---:|---|
| BOOKING.CONFIRMED | 62 | Booking confirmation occurred |
| PAYMENT.SUCCEEDED | 61 | Payment success occurred |
| MESSAGE.DELIVERED | 97 | Notification/message delivery fact occurred |
| LOYALTY.REDEEMED | Loyalty domain | Redemption occurred |

Events are immutable facts. Durable publication belongs to 92. No second event bus may be introduced.

## 7. Job / Worker Registry

- Async execution owner: 93.
- Workflow semantics remain owned by 38.
- Durable events remain owned by 92.
- Workers must be idempotent/fenced where required.
- Retries are bounded.
- Jobs are tenant-scoped.
- Business logic remains in the domain owner, not in the worker framework.
- No second worker engine.

## 8. Realtime Ownership Registry

- Transport/sync owner: 98.
- Domain state owners remain authoritative.
- No canonical realtime business state.
- No client-side authorization.
- No cross-tenant realtime.
- No silent booking/payment merge.
- No duplicate action; idempotency required.
- 98 uses the durable event/runtime architecture rather than creating a second event bus or worker engine.

## 9. Notification Ownership Registry

- Delivery owner: 97.
- Realtime transport: 98.
- Queues/workers: 93.
- Business state remains owned by the originating domain.
- Legacy notification writers are redirected/read-only/deprecated according to the migration plan.

## 10. Legacy / Redirect Registry

| Legacy area | Canonical target | Required behavior |
|---|---:|---|
| Finance 12/33/46 | 61 | Projection/read-only/migration; no competing financial writes |
| Reviews 47/59/75 | 86 | Transfer/consolidate; no competing review writes |
| Search 36/50/82 | 94 | Consolidate mechanics; no parallel index engine |
| Notifications 11/35/39/42/55/84 | 97 | Redirect/read-only/deprecated |
| Realtime mechanics 23/57/60/92/93/97 | 98 | Consolidate transport; domains retain state ownership |
| Content 37/58 | 83 | Content semantics remain canonical in 83 |
| Storage mechanics 49 | 96 | Storage/file mechanics remain in 96 |
| Identity foundations 02/25/35 | 90 | Consolidate identity/session ownership |
| Organization foundations 40/52 | 89 | Organization/tenant structure remains in 89 |

Legacy behavior may remain readable during migration, but must never retain competing write authority.

## 11. Tenant / RLS Security Matrix

- Tenant isolation is enforced server-side.
- RLS is mandatory for tenant-scoped data.
- Authorization is owned by 53; organization context by 89; authentication/session by 90.
- No frontend state is a security boundary.
- No result, file, event, job, search operation, notification or realtime channel may cross tenants.
- Secrets remain server-side and out of committed source.
- Sensitive actions are auditable through 80.

## 12. Dependency Graph

```text
Master Blueprint V3
        ↓
PDF 00 — normative overrides
        ↓
PDF 42.5 — architecture/dependency governance
        ↓
Foundation / Core
        ↓
Identity 90 + Tenant 89 + Authorization 53
        ↓
Housing / Stays / Availability 64
        ↓
Booking 62
        ↓
Pricing 87
        ↓
Payment / Finance 61
        ↓
Durable Events 92
        ↓
CRM 41 / Messaging 60 / Workflow 38
        ↓
Notifications 97 / Realtime 98 / Async 93
        ↓
Search 94 / Content 83 / Storage 96 / AI 95
        ↓
Audit 80 / Observability 54 / Governance 79 / Control Plane 99
```

Cross-domain flows must use explicit commands, authorized APIs and/or durable events. No downstream projection becomes a new source of truth.

## 13. Migration / Consolidation Matrix

A consolidation is complete only when ownership, writes, migration, redirects and tests are explicit.

Required sequence:

1. Identify legacy owner and canonical owner.
2. Transfer useful requirements into the canonical owner.
3. Define data migration before destructive removal.
4. Redirect legacy references.
5. Disable competing writes.
6. Keep read-only access only when justified.
7. Run ownership, cross-domain write, idempotency/replay, tenant/RLS and regression tests.
8. Remove legacy implementation only after the migration gate passes.

## 14. Foundation Gate

**STATUS: ARCHITECTURE / GOVERNANCE LOCKED — NOT PRODUCT GO.**

Before feature expansion, the repository must preserve:

- one canonical owner per domain;
- one source of truth per business concern;
- no duplicate runtime engines;
- explicit command/event contracts;
- server-side tenant/RLS enforcement;
- explicit state transitions;
- auditable sensitive actions;
- no secrets committed;
- migration and legacy behavior explicitly governed.

This registry does not create database tables, migrations, fake data or business features.
