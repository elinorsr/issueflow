# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev       # Start with hot reload
npm run start:debug     # Start with debugger attached

# Build & Production
npm run build           # Compile TypeScript via NestJS CLI
npm run start:prod      # Run compiled output

# Tests
npm test                # Run all unit tests
npm run test:watch      # Watch mode
npm run test:cov        # With coverage
npm run test:e2e        # End-to-end tests (./test/jest-e2e.json)

# Code quality
npm run lint            # ESLint with auto-fix
npm run format          # Prettier format

# Database (Docker)
docker compose up -d    # Start PostgreSQL (port 5432, credentials: issueflow/issueflow/issueflow)
```

Environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET` (default: `issueflow-secret`). Server listens on port 3000.

## Architecture

**Stack:** NestJS 10 + TypeScript + PostgreSQL + TypeORM + Passport JWT

Feature-driven module structure — each module owns its entity, repository, service, controller, and DTOs. Key modules:

- **Auth** (`src/auth/`) — JWT login/logout. Logout uses an in-memory token denylist (jti-based). `JwtAuthGuard` is applied globally; routes opt out via `@Public()`.
- **Users** (`src/users/`) — ADMIN and DEVELOPER roles. Auto-assignment picks the DEVELOPER with fewest open tickets (ties broken by oldest `created_at`).
- **Projects** (`src/projects/`) — Soft-delete with cascade to tickets. ADMIN-only restore endpoint.
- **Tickets** (`src/tickets/`) — Core entity. Status flow is forward-only: `TODO → IN_PROGRESS → IN_REVIEW → DONE`. Priority levels (`LOW → MEDIUM → HIGH → CRITICAL`) escalate hourly via cron unless `escalation_reset = true`. Optimistic locking via `@VersionColumn` — clients must send `version` on PATCH. Soft-deletable.
- **Comments** (`src/comments/`) — Parses `@username` mentions (regex) into a ManyToMany `comment_mentions` junction table. Also uses `@VersionColumn`.
- **Attachments** (`src/attachments/`) — multer upload (10MB max), files stored on disk, metadata in DB.
- **Audit** (`src/audit/`) — Append-only `AuditLog` entity. Every service action (CREATE, UPDATE, DELETE, RESTORE, LOGIN, LOGOUT, AUTO_ASSIGN, ESCALATE, etc.) writes a log entry with a JSONB `metadata` field.
- **Scheduler** (`src/scheduler/`) — `@Cron` job runs hourly to escalate overdue ticket priorities by one level.

## Key Patterns

**Soft Delete:** Entities use `@DeleteDateColumn()`. Queries filter `deleted_at: null` by default. ADMIN can restore via `/restore` endpoints.

**Optimistic Locking:** Tickets and comments carry a `version` column. On PATCH, pass the current `version`; a mismatch throws `409 ConflictException`.

**Blocker Prevention:** `TicketDependency` (ticket A blocked by B) is enforced at status transition — a ticket cannot move to `DONE` while it has unresolved blockers.

**CSV Import/Export:** Full ticket export with all fields; import validates enums and resolves assignees by username.

**Global Validation:** `ValidationPipe` configured with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`. `AllExceptionsFilter` normalizes error responses.

**Database:** `synchronize: true` is active (dev convenience — schema is auto-created on startup). TypeORM entities are in `src/**/*.entity.ts`.
