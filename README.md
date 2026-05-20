# IssueFlow — Ticket Management Backend Platform

TDP 2026 Home Assignment | Built with NestJS + TypeScript + PostgreSQL

> AI Model used: **Claude Sonnet 4.6** (`claude-sonnet-4-6`)

## Quick Start

```bash
npm install
docker compose up -d
npm run start:dev
```

See [run.md](./run.md) for full setup instructions.

## API Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/login | ❌ | Login, returns JWT |
| POST | /auth/logout | ✅ | Invalidate token |
| GET | /auth/me | ✅ | Current user profile |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /users | ❌ | Register user |
| GET | /users | ✅ | List all users |
| GET | /users/:id | ✅ | Get user by id |
| PATCH | /users/:id | ✅ | Update user |
| DELETE | /users/:id | ✅ | Delete user |
| GET | /users/:id/mentions | ✅ | Comments where user was @mentioned |

### Projects
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | /projects | ✅ | Any | Create project |
| GET | /projects | ✅ | Any | List projects |
| GET | /projects/:id | ✅ | Any | Get project |
| PATCH | /projects/:id | ✅ | Any | Update project |
| DELETE | /projects/:id | ✅ | Any | Soft delete project |
| GET | /projects/deleted | ✅ | ADMIN | List soft-deleted projects |
| POST | /projects/:id/restore | ✅ | ADMIN | Restore soft-deleted project |
| GET | /projects/:id/workload | ✅ | Any | Developer workload in project |

### Tickets
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | /tickets | ✅ | Any | Create ticket (auto-assigns if no assigneeId) |
| GET | /projects/:id/tickets | ✅ | Any | Tickets in project |
| GET | /tickets/:id | ✅ | Any | Get ticket |
| PATCH | /tickets/:id | ✅ | Any | Update ticket (send `version` for optimistic locking) |
| DELETE | /tickets/:id | ✅ | Any | Soft delete ticket |
| GET | /tickets/deleted?projectId= | ✅ | ADMIN | Soft-deleted tickets |
| POST | /tickets/:id/restore | ✅ | ADMIN | Restore ticket |
| GET | /tickets/export?projectId= | ✅ | Any | Export tickets as CSV |
| POST | /tickets/import?projectId= | ✅ | Any | Import tickets from CSV |

### Ticket Dependencies
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /tickets/:id/dependencies | ✅ | Add blocker `{ "blockedBy": 42 }` |
| GET | /tickets/:id/dependencies | ✅ | List blockers |
| DELETE | /tickets/:id/dependencies/:blockerId | ✅ | Remove blocker |

### Comments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /tickets/:id/comments | ✅ | Add comment (supports @mentions) |
| GET | /tickets/:id/comments | ✅ | List comments |
| PATCH | /comments/:id | ✅ | Update comment (send `version` for optimistic locking) |
| DELETE | /comments/:id | ✅ | Delete comment |

### Attachments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /tickets/:id/attachments | ✅ | Upload file (field: `file`, max 10MB) |
| GET | /tickets/:id/attachments | ✅ | List attachments |
| GET | /tickets/:id/attachments/:id/download | ✅ | Download file |
| DELETE | /tickets/:id/attachments/:id | ✅ | Delete attachment |

### Audit Log
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /audit-logs | ✅ | All logs (filter: `action`, `entity_type`, `entity_id`, `actor_id`) |

## Business Rules

- Ticket status moves forward only: `TODO → IN_PROGRESS → IN_REVIEW → DONE`
- DONE tickets cannot be updated
- A ticket cannot be marked DONE if it has unresolved blockers
- Concurrent updates protected by optimistic locking — send `version` from GET response
- Priority escalation runs every hour for overdue tickets
- Auto-assignment picks the DEVELOPER with fewest open tickets (ties → oldest registrant)
- Soft-deleted records hidden from standard responses; ADMIN can restore them
