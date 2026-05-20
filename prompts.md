# prompts.md — AI Agent Interaction Log

## Model Used
**Claude Sonnet 4.6** (`claude-sonnet-4-6`) via claude.ai

---

## Session Overview

The entire backend was built in a single guided session with Claude acting as a senior software engineer. The work was broken into 6 stages, each planned, written, and verified before moving on.

---

## Stage 1 — Infrastructure + Users + Auth

**Prompt:**
> "יש לנו משימת פיתוח מעניינת, אני רוצה שתהפוך להיות מהנדס תוכנה בכיר. אני שולחת לך קבצים ותגיד לי איך תרצה שנתחיל"

**Agent actions:**
- Read all uploaded skeleton files and the requirements PDF
- Presented full architecture diagram with 6-stage development plan
- Built: `database.config.ts`, `User` entity, `UsersService/Controller/Module`, `AuthService`, `JwtStrategy`, `TokenDenylistService`, `AuthController`, global `ValidationPipe` and `AllExceptionsFilter`
- Fixed: switched `bcrypt` → `bcryptjs` (no native build tools), repaired corrupt `tsconfig.json`
- Verified: `npx tsc --noEmit` → 0 errors

---

## Stage 2 — Projects + Tickets

**Prompt:** "כן" (confirmed to proceed)

**Agent actions:**
- Built `Project` entity with soft delete (`@DeleteDateColumn`)
- Built `Ticket` entity with `@VersionColumn` for optimistic locking, all enums (Status/Priority/Type), `due_date`, `is_overdue`, `escalation_reset`
- Implemented status lifecycle enforcement (`STATUS_ORDER` array, forward-only validation)
- Implemented optimistic locking (version mismatch → 409 Conflict)
- Implemented auto-assign (least-loaded DEVELOPER, ties broken by registration order)
- Built workload endpoint `GET /projects/:id/workload`
- Verified: 0 TS errors

---

## Stage 3 — Comments + @Mentions

**Prompt:** "כן"

**Agent actions:**
- Built `Comment` entity with `@ManyToMany` → `comment_mentions` join table
- Implemented `@mention` parsing with regex, case-insensitive DB lookup, deduplication
- On comment update: re-evaluates mentions (adds new, removes old)
- Added `GET /users/:id/mentions` endpoint
- Used `forwardRef()` to resolve circular dependency between `UsersModule` and `CommentsModule`
- Verified: 0 TS errors

---

## Stage 4 — Audit Log + Dependencies

**Prompt:** "כן"

**Agent actions:**
- Built `AuditLog` entity (append-only, `jsonb` metadata)
- Built `AuditService` with generic `log()` method and filtered `findAll()`
- Wired audit logging into all Tickets mutations (CREATE/UPDATE/DELETE/RESTORE + AUTO_ASSIGN with `actor='SYSTEM'`)
- Built `TicketDependency` entity with `@Unique` constraint
- Built `DependenciesService` with same-project validation, self-dependency check
- Blocked DONE transition when unresolved blockers exist
- Verified: 0 TS errors

---

## Stage 5 — Attachments + CSV Export/Import

**Prompt:** "כן"

**Agent actions:**
- Built `Attachment` entity + multer disk storage
- Validated mime types (`image/png`, `image/jpeg`, `application/pdf`, `text/plain`) and 10MB limit
- Built `GET .../download` with correct `Content-Disposition` headers
- Built `CsvService` using `csv-stringify` (export) and `csv-parse` (import)
- Import: per-row validation, partial success (`{ created, failed, errors }`)
- Verified: 0 TS errors

---

## Stage 6 — Scheduler + Tests + Docs

**Prompt:** "כן"

**Agent actions:**
- Built `EscalationScheduler` with `@Cron(EVERY_HOUR)` — promotes priority, sets `is_overdue`, respects `escalation_reset` flag, idempotent on CRITICAL
- Wrote 4 test suites / 25 tests covering:
  - UsersService: create, findOne, conflict detection
  - TicketsService: lifecycle transitions, optimistic locking, blocker check, escalation reset
  - CommentsService: @mention parsing, deduplication, optimistic locking
  - EscalationScheduler: all escalation paths including idempotency and reset
- All 25 tests pass
- Wrote `run.md` with full setup instructions

---

## Key Technical Decisions Made by Agent

| Decision | Rationale |
|----------|-----------|
| `bcryptjs` instead of `bcrypt` | No native C++ build tools available |
| In-memory token deny-list | Simple, sufficient for assignment scope |
| `synchronize: true` in TypeORM | Dev convenience — no migrations needed |
| `forwardRef()` for circular deps | Users ↔ Comments circular dependency |
| `@VersionColumn()` for optimistic locking | TypeORM built-in, clean solution |
| `STATUS_ORDER` array for lifecycle | Single source of truth for valid transitions |
