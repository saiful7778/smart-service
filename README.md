# Smart Service - A Service Business Management SaaS - Technical Database Documentation

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
