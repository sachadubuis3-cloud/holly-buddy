# Holly Buddy — Source of Truth Register

This register is intentionally a foundation checkpoint. It records governance rules before domain-specific ownership is implemented.

| Area | Canonical source | Write authority | Status |
|---|---|---|---|
| Architecture hierarchy | Master Blueprint V3 + PDF 00 + PDF 42.5 | Architecture governance | LOCKED |
| UI state | Domain APIs / server state | Domain owner | FOUNDATION |
| Domain data | Canonical domain owner | Domain command/API | FOUNDATION |
| Authorization | Server-side authorization + RLS | Backend/security layer | FOUNDATION |
| Audit evidence | Canonical audit subsystem | Authorized backend handlers | FOUNDATION |
| Events | Immutable event records | Responsible command handler | FOUNDATION |
| Jobs | Job/worker owner | Job dispatcher/worker | FOUNDATION |

## Rule

No domain-specific table, service, frontend store, or integration may be declared canonical until its owner and write boundary are documented here or in the relevant domain register.

## Conflict handling

If two documents or implementations claim competing ownership, stop the affected implementation and record the conflict as a BLOCKER. Do not choose an owner implicitly.
