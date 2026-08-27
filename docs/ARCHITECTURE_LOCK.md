# Holly Buddy — Architecture Lock

## Authority

- Master Blueprint V3: supreme functional and architectural source.
- PDF 00: normative overrides applied to PDFs 01–100.
- PDF 42.5: architecture lock, source-of-truth and dependency governance.
- PDFs 01–100: implementation requirements subject to the higher layers.
- UI/UX: projection only; never a source of truth.

## Non-negotiable rules

1. One canonical owner per domain.
2. No duplicate concurrent business engines.
3. Legacy components may remain readable during migration but must not retain competing write authority.
4. Every write must have an explicit owner and authorized command/API boundary.
5. Events represent immutable facts; commands represent authorized requests for action.
6. Tenant isolation and authorization are enforced server-side; frontend state is never the security boundary.
7. State transitions must be explicit and invalid transitions rejected.
8. Secrets and environment-specific configuration are never committed.

## Pre-implementation gates

Before broad feature implementation, maintain these artifacts:

- canonical domain registry
- source-of-truth matrix
- database ownership matrix
- API/service ownership matrix
- command registry
- event registry
- job/worker registry
- realtime ownership registry
- notification ownership registry
- legacy/redirect registry
- tenant/RLS security matrix
- dependency graph
- test matrix

## Change discipline

Changes must be incremental and reviewable. A domain is not considered consolidated until ownership, writes, migrations, redirects, and tests are explicit. Contradictions between authoritative documents must be recorded as blockers rather than resolved silently.
