# Smart Service - A Service Business Management SaaS - Technical Database Documentation

## Table of Contents

- [1. Overview](#1-overview)
- [2. Core Business Workflow](#2-core-business-workflow)
  - [The Entity Hierarchy](#the-entity-hierarchy)
  - [Supported Flow Paths](#supported-flow-paths)
- [3. Key Architectural Decisions](#3-key-architectural-decisions)
  - [3.1. Better-Auth Integration](#31-better-auth-integration)
  - [3.2. Soft Delete Strategy](#32-soft-delete-strategy)
  - [3.3. Timezone Management](#33-timezone-management)
  - [3.4. File Management](#34-file-management)
- [4. Core Data Models: The "Ops Trinity"](#4-core-data-models-the-ops-trinity)
  - [Job Assignments](#job-assignments-the-who)
  - [Schedules](#schedules-the-when---planned)
  - [Time Entries](#time-entries-the-when---actual)
- [5. Deletion Rules & Foreign Key Behaviors](#5-deletion-rules--foreign-key-behaviors)
- [6. Enum Definitions & Status Lifecycles](#6-enum-definitions--status-lifecycles)
  - [Lead Status Lifecycle](#lead-status-lifecycle)
  - [Job Status Lifecycle](#job-status-lifecycle)
  - [Job Assignment Status](#job-assignment-status)
- [7. Index Strategy](#7-index-strategy)
- [8. Installation & Dev Setup](#8-installation--dev-setup)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Manual Setup](#manual-setup)
  - [Available Commands](#available-commands)
  - [Environment Variables](#environment-variables)
  - [Project Structure](#project-structure)

---

## 1. Overview

This document outlines the database architecture and technical implementation details for the Service Business Management SaaS platform. The application is designed to manage the complete lifecycle of service businesses, from CRM (Customer/Lead management) to Operations (Job dispatch, Scheduling, Time Tracking) and future Financials (Invoicing, Payments).

### Core Tech Stack

- **Database:** PostgreSQL (Hosted on Supabase)
- **ORM:** Drizzle ORM (TypeScript)
- **Authentication/Identity:** Better-Auth (Manages `users`, `sessions`, `accounts`, `organizations`, `organization_members`, `invitations`)
- **Background Jobs:** Supabase pg_cron (Orphan cleanup, soft-delete hard deletion)

---

## 2. Core Business Workflow

The system supports a flexible workflow allowing businesses to operate via a strict CRM pipeline or via quick, standalone operational booking.

### The Entity Hierarchy

1.  **Customer:** The persistent entity representing a person or business.
2.  **Lead:** A specific inquiry or opportunity. A customer can have multiple leads over time (e.g., a plumbing inquiry today, an electrical inquiry 6 months from now).
3.  **Job:** The actual work to be performed. A lead can generate multiple jobs (e.g., a single inquiry results in a job for the main office and a separate job for the warehouse).

### Supported Flow Paths

- **Standard CRM Path:** `Customer` → `Lead` → `Job` → `Schedule` → `Time Entry`
- **Standalone Operations Path:** `Job` → `Schedule` → `Time Entry` _(A dispatcher can bypass the CRM entirely for quick, repeat, or walk-in jobs by leaving `customer_id` and `lead_id` null)._

---

## 3. Key Architectural Decisions

### 3.1. Better-Auth Integration

Better-Auth strictly handles core identity tables. To extend these tables without breaking Better-Auth migrations:

- **User Settings:** We use a 1:1 `user_settings` table linked via `user_id` to store application-specific preferences (timezone, locale, currency).
- **RBAC:** We use `user_roles` and `org_member_roles` junction tables rather than adding role columns directly to Better-Auth managed tables.

### 3.2. Soft Delete Strategy

Soft deletion is implemented on business-critical tables (`leads`, `customers`, `materials`, `files`, `addresses`, `jobs`) to allow for data recovery.

- **Implementation:** Uses `deleted_at` (timestamp) and `deleted_by` (uuid) columns.
- **Querying:** All standard application queries must explicitly filter `WHERE deleted_at IS NULL`. Drizzle's `isNull()` helper is used for this.
- **Hard Deletion:** A Supabase `pg_cron` job runs nightly to permanently `DELETE` records where `deleted_at IS NOT NULL` and `deleted_at < NOW() - INTERVAL '30 days'`.
- **Cascading Soft Deletes:** When soft-deleting a parent (e.g., Customer), the application layer is responsible for soft-deleting dependent records (e.g., Leads belonging to that Customer) within a transaction.

### 3.3. Timezone Management

Timezones are critical for scheduling across different regions.

- **Storage:** All timestamps in PostgreSQL are stored in `UTC` (`timestamp with time zone`).
- **User Preference:** The user's preferred timezone is stored in `user_settings.timezone`.
- **Display:** The application uses `date-fns-tz` (`formatInTimeZone` and `utcToZonedTime`) to convert UTC database times into the user's local timezone on the frontend and API response layers.

### 3.4. File Management (Hybrid Approach)

- Better-Auth tables (`users`, `organizations`) use simple string fields (`image`, `logo`) for static assets.
- Business logic tables use a centralized `files` table with polymorphic references (`entity_type`, `entity_id`) combined with junction tables (`lead_attachments`, `material_files`, `job_attachments`) for strict referential integrity where needed.
- **Orphan Cleanup:** A `pg_cron` job deletes files where `entity_id IS NULL AND uploaded_at < NOW() - INTERVAL '24 hours'` to clean up abandoned multi-step form uploads.

---

## 4. Core Data Models: The "Ops Trinity"

The operational backbone of the application relies on the interconnected relationship between **Assignments**, **Schedules**, and **Time Entries**.

### Job Assignments (The "Who")

Determines who is responsible for the overall Job.

- A Job can have multiple assignments (e.g., 1 Primary, 1 Secondary, 1 Supervisor).
- Assignments have statuses (`pending`, `active`, `completed`, `declined`) allowing staff to accept/reject work.
- _Rule:_ A user should not be scheduled or track time against a job unless they have an active `JobAssignment` record.

### Schedules (The "When - Planned")

Represents the planned calendar blocks (shifts) for a Job.

- **Crew Scheduling:** Uses a `schedule_assignments` junction table. One Schedule block can have multiple assignees. This allows a dispatcher to reschedule an entire crew by updating a single schedule record.
- Schedules are strictly hard-deleted (`ON DELETE CASCADE` from Jobs). If a schedule is deleted, its associated time entries are also deleted, as the plan no longer exists.

### Time Entries (The "When - Actual")

Represents the real-time tracking of labor.

- **Personal Tracking:** Time entries are tied to an `org_member_id`, not just a Job. A "Start Timer" button belongs to the user, not the job.
- **Schedule Linkage:** Time entries optionally link to a `schedule_id` to allow for "Variance Reporting" (comparing Planned vs. Actual hours).
- **Labor Aggregation:** Total job hours are calculated by summing `duration_minutes` from `time_entries` for a given `job_id`.

---

## 5. Deletion Rules & Foreign Key Behaviors

To protect historical data integrity and enforce business logic, FK constraints are carefully configured:

| Parent Table     | Child Table / Column                    | On Delete Behavior | Business Reason                                                                                      |
| :--------------- | :-------------------------------------- | :----------------- | :--------------------------------------------------------------------------------------------------- |
| **Organization** | Most business tables (`org_id`)         | `CASCADE`          | If an org is destroyed, destroy all its data.                                                        |
| **User**         | `user_activities`, `sessions`           | `CASCADE`          | If a user is deleted, wipe their auth logs.                                                          |
| **User**         | `files.uploaded_by`, `leads.deleted_by` | `SET NULL`         | Preserve the file/lead history even if the user is deleted.                                          |
| **Customer**     | `jobs.customer_id`                      | `SET NULL`         | **Critical:** Preserves job history/revenue even if the customer is deleted. Job becomes standalone. |
| **Lead**         | `jobs.lead_id`                          | `SET NULL`         | **Critical:** Preserves job history/revenue even if the lead is deleted. Job becomes standalone.     |
| **Schedule**     | `time_entries.schedule_id`              | `CASCADE`          | If the planned schedule is canceled/deleted, the intended time entry is also removed.                |
| **Job**          | `job_assignments`, `schedules`          | `CASCADE`          | If a job is hard-deleted, wipe its assignments and schedule blocks.                                  |

---

## 6. Enum Definitions & Status Lifecycles

### Lead Status Lifecycle

Represents the sales pipeline.

- `new` → `contacted` → `qualified` → `converted` (Creates Job)
- `contacted` / `qualified` → `nurture` (Not ready to buy, follow up later)
- `new` / `contacted` → `lost` (Went to competitor) / `disqualified` (Not a fit) / `cancelled`

### Job Status Lifecycle

Represents the operational pipeline.

- `draft` → `scheduled` → `in_progress` → `needs_review` → `completed`
- `scheduled` / `in_progress` → `on_hold` → `scheduled` (Resumed)
- Any status → `cancelled`

### Job Assignment Status

- `pending` (Awaiting acceptance) → `active` (Accepted) → `completed`
- `pending` → `declined` (Rejected by staff)
- Any status → `cancelled` (Removed by dispatcher)

---

## 7. Index Strategy

To ensure high performance at scale in a multi-tenant environment, the following composite indexes are strictly enforced:

1.  **Tenant Isolation:** Most queries filter by `organization_id` (or `org_id`). We use composite indexes starting with the Org ID (e.g., `(organization_id, status)` on `leads` and `jobs`).
2.  **Dashboard Queries:** `jobs(organization_id, status)` and `jobs(organization_id, created_at)` ensure fast dashboard loads.
3.  **Calendar Queries:** `schedules(org_id, start_at)` ensures fast Full-Calendar API responses.
4.  **Notification Inbox:** `notifications(recipient_id, is_read, created_at)` ensures the unread notification badge loads instantly.
5.  **Soft Delete Auditing:** Indexes on `deleted_at` and `deleted_by` allow fast admin queries for "Trash Bin" views and audit logs.

---

## 8. Installation & Dev Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | `>=20` (`.nvmrc`: `24.16.0`) | JavaScript runtime |
| **pnpm** | `10.33.4` | Package manager |
| **Docker** | latest | Redis, MailHog services |
| **Supabase CLI** | latest | Local Supabase (DB, Auth, Storage) |
| **Turbo** | `^2.9.16` (included via pnpm) | Monorepo task runner |

### Quick Start

```bash
# 1. Clone and enter the repository
git clone <repo-url> smart_service
cd smart_service

# 2. Run the automated setup script
bash scripts/setup.sh
```

The setup script handles: Node version check, pnpm install, Docker service startup (Redis, MailHog), Supabase local start, DB migrations, and seed data.

### Manual Setup

```bash
# 1. Set Node version
nvm use

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.development.local.example .env.development.local  # if example exists

# 4. Start infrastructure services (Redis, MailHog)
pnpm docker:dev:up

# 5. Start local Supabase
pnpm supabase:start

# 6. Apply database migrations
pnpm supabase:migration:up

# 7. Seed the database
pnpm supabase:db:reset
pnpm seed:storage

# 8. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all workspaces in dev mode |
| `pnpm build` | Build all workspaces |
| `pnpm lint` | Run ESLint across all workspaces |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run all tests |
| `pnpm format` | Format code with Prettier |
| **Supabase** | |
| `pnpm supabase:start` | Start local Supabase services |
| `pnpm supabase:stop` | Stop local Supabase |
| `pnpm supabase:studio` | Open Supabase Studio (DB GUI) |
| `pnpm supabase:db:push` | Push schema changes to local DB |
| `pnpm supabase:db:pull` | Pull remote schema to local |
| `pnpm supabase:db:reset` | Reset DB (re-applies migrations + seed) |
| `pnpm supabase:migration:new` | Create a new migration |
| `pnpm supabase:migration:up` | Apply pending migrations |
| **Docker** | |
| `pnpm docker:dev:up` | Start Redis & MailHog containers |
| `pnpm docker:dev:down` | Stop all Docker containers |
| **Seed** | |
| `pnpm seed:storage` | Seed Supabase Storage buckets |
| **Drizzle** | |
| `npx drizzle-kit studio` | Open Drizzle Studio (DB browser) |
| `npx drizzle-kit generate` | Generate migrations from schema changes |
| `npx drizzle-kit migrate` | Apply pending migrations |

### Environment Variables

Key environment variables used by the project (configure in `.env` and `.env.development.local`):

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Redis (via Upstash or local)
REDIS_REST_URL=http://localhost:8079
REDIS_REST_TOKEN=

# Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-here
GOOGLE_AUTH_CLIENT_SECRET=xxx
NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID=xxx

# Mail
MAIL_FROM=noreply@smartservice.local
SUPPORT_MAIL=support@smartservice.local
GOOGLE_MAIL_USER=
GOOGLE_MAIL_PASS=
MAILHOG_HOST=localhost
MAILHOG_PORT=1025

# Storage
SUPABASE_SECRET_KEY=xxx
SUPABASE_PUBLIC_STORAGE_BUCKET=public_file_storage
SUPABASE_PRIVATE_STORAGE_BUCKET=private_file_storage

# Web Push (Notifications)
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=xxx
WEB_PUSH_PRIVATE_KEY=xxx

# QStash (Background Jobs)
QSTASH_URL=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
CRON_API_KEY=xxx
```

See `turbo.json` for the complete list of global environment variables.

### Project Structure

```
smart_service/
├── apps/
│   ├── web/                    # Next.js application (frontend + API)
│   └── storybook/              # Storybook component library
├── packages/
│   ├── drizzle/                # Database schema, migrations, Drizzle config
│   ├── ui/                     # Shared UI components (shadcn/ui, Radix)
│   ├── lib/                    # Shared utilities and helpers
│   ├── mail/                   # Email sending (Nodemailer)
│   ├── pdf/                    # PDF generation (@react-pdf/renderer)
│   ├── eslint-config/          # Shared ESLint configuration
│   ├── typescript-config/      # Shared TypeScript configuration
│   └── vitest-config/          # Shared Vitest configuration
├── infra/
│   └── docker/                 # Docker Compose files for local dev
├── scripts/
│   ├── setup.sh                # Automated setup script
│   ├── docker-compose-wrapper.sh
│   └── seed/                   # Database seed scripts
├── supabase/
│   ├── migrations/             # SQL migrations
│   ├── seed.sql                # Seed data (permissions, roles)
│   ├── config.toml             # Supabase local config
│   └── functions/              # Supabase Edge Functions
├── .nvmrc                      # Node.js version
├── pnpm-workspace.yaml         # pnpm workspace config
├── turbo.json                  # Turborepo pipeline config
└── package.json                # Root package.json
```
