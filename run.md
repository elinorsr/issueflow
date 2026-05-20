# IssueFlow — Setup & Run Guide

## Prerequisites

- Node.js 18+
- npm 9+
- Docker + Docker Compose

## 1. Install dependencies

```bash
npm install
```

## 2. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL instance on port 5432 with:
- user: `issueflow`
- password: `issueflow`
- database: `issueflow`

The schema is created automatically by TypeORM on first run (`synchronize: true`).

## 3. Environment variables (optional)

The app works out of the box with defaults. To override:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=issueflow
export DB_PASSWORD=issueflow
export DB_NAME=issueflow
export JWT_SECRET=your-secret-key
```

## 4. Run the application

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The server starts on **http://localhost:3000**

Health check: `GET /` → `IssueFlow is running!`

## 5. Run tests

```bash
# Unit tests
npm test

# With coverage
npm run test:cov
```

## API Overview

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Login, returns JWT |
| POST | /auth/logout | Invalidate token |
| GET | /auth/me | Current user profile |

### Users
| Method | Path | Description |
|--------|------|-------------|
| POST | /users | Register user |
| GET | /users | List all users |
| GET | /users/:id | Get user |
| PATCH | /users/:id | Update user |
| DELETE | /users/:id | Delete user |
| GET | /users/:id/mentions | Comments where user was @mentioned (query: `page`, `pageSize`) |

### Projects
| Method | Path | Description |
|--------|------|-------------|
| POST | /projects | Create project |
| GET | /projects | List projects |
| GET | /projects/:id | Get project |
| PATCH | /projects/:id | Update project |
| DELETE | /projects/:id | Soft delete project |
| POST | /projects/:id/restore | Restore soft-deleted project |
| GET | /projects/deleted | List soft-deleted projects |
| GET | /projects/:id/workload | Developer workload in project |

### Tickets
| Method | Path | Description |
|--------|------|-------------|
| POST | /tickets | Create ticket |
| GET | /projects/:id/tickets | Tickets in project |
| GET | /tickets/:id | Get ticket |
| PATCH | /tickets/:id | Update ticket |
| DELETE | /tickets/:id | Soft delete ticket |
| POST | /tickets/:id/restore | Restore ticket |
| GET | /tickets/deleted?projectId= | Soft-deleted tickets |
| GET | /tickets/export?projectId= | Export tickets as CSV |
| POST | /tickets/import?projectId= | Import tickets from CSV |

### Ticket Dependencies
| Method | Path | Description |
|--------|------|-------------|
| POST | /tickets/:id/dependencies | Add blocker `{ blockedBy: 42 }` |
| GET | /tickets/:id/dependencies | List blockers |
| DELETE | /tickets/:id/dependencies/:blockerId | Remove blocker |

### Comments
| Method | Path | Description |
|--------|------|-------------|
| POST | /tickets/:id/comments | Add comment |
| GET | /tickets/:id/comments | List comments |
| PATCH | /comments/:id | Update comment |
| DELETE | /comments/:id | Delete comment |

### Attachments
| Method | Path | Description |
|--------|------|-------------|
| POST | /tickets/:id/attachments | Upload file (multipart/form-data, field: `file`) |
| GET | /tickets/:id/attachments | List attachments |
| GET | /tickets/:id/attachments/:id/download | Download file |
| DELETE | /tickets/:id/attachments/:id | Delete attachment |

### Audit Log
| Method | Path | Description |
|--------|------|-------------|
| GET | /audit-logs | All logs (filter: `action`, `entity_type`, `entity_id`, `actor`) |

## Key Business Rules

- All endpoints except `POST /users` and `POST /auth/login` require a Bearer JWT token
- Ticket status can only move forward: `TODO → IN_PROGRESS → IN_REVIEW → DONE`
- DONE tickets cannot be updated
- A ticket cannot be marked DONE if it has unresolved blockers
- Concurrent updates are protected by optimistic locking — send `version` field from the GET response
- Priority escalation runs every hour automatically for overdue tickets
- Auto-assignment picks the DEVELOPER with fewest open tickets in the project

## AI Usage

Model used: **Claude Sonnet 4.6** (claude-sonnet-4-6)

See `prompts.md` for full interaction log.
