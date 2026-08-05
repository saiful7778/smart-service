# Graph Report - smart_service  (2026-08-05)

## Corpus Check
- 926 files · ~448,776 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 746 nodes · 827 edges · 31 communities (28 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `07ddc349`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]

## God Nodes (most connected - your core abstractions)
1. `MailService` - 33 edges
2. `scripts` - 16 edges
3. `scripts` - 12 edges
4. `overrides` - 11 edges
5. `scripts` - 9 edges
6. `exports` - 8 edges
7. `scripts` - 7 edges
8. `scripts` - 7 edges
9. `exports` - 6 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `CreateFeedbackIssueDialog()` --calls--> `useCreateFeedbackIssue()`  [EXTRACTED]
  apps/web/features/feedback/components/CreateFeedbackIssueDialog.tsx → apps/web/features/feedback/api/feedback.api.hook.ts
- `ReplyForm()` --calls--> `useReplyFeedbackIssue()`  [EXTRACTED]
  apps/web/features/feedback/components/FeedbackIssueDetails.tsx → apps/web/features/feedback/api/feedback.api.hook.ts
- `StatusControl()` --calls--> `useUpdateFeedbackIssueStatus()`  [EXTRACTED]
  apps/web/features/feedback/components/FeedbackIssueDetails.tsx → apps/web/features/feedback/api/feedback.api.hook.ts

## Import Cycles
- None detected.

## Communities (31 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (51): "accounts", "addresses", "contact_submission_replies", "contact_submissions", "customer_addresses", "customers", "feedback_issue_replies", "feedback_issues" (+43 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (46): author, contributors, dependencies, better-auth, drizzle-orm, drizzle-zod, @electric-sql/pglite, postgres (+38 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (38): FeedbackIssueRepliedMail(), FeedbackIssueRepliedMailProps, FeedbackIssueStatusChangedMail(), FeedbackIssueStatusChangedMailProps, FeedbackIssueSubmittedMail(), FeedbackIssueSubmittedMailProps, ContactSubmittedMail(), ContactSubmittedMailProps (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (42): dependencies, @base-ui/react, better-auth, @better-auth/drizzle-adapter, @bprogress/next, date-fns, drizzle-orm, @hookform/resolvers (+34 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (38): author, contributors, dependencies, react, react-dom, @workspace/ui, devDependencies, @chromatic-com/storybook (+30 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (35): ActionTypeEnumSchema, ContactSubmissionStatusEnumSchema, ContactSubmissionStatusEnumType, EntityTypeEnumSchema, EntityTypeEnumType, FeedbackIssueStatusEnumSchema, FeedbackIssueStatusEnumType, FeedbackIssueTypeEnumSchema (+27 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (35): author, contributors, engines, node, license, name, brace-expansion, esbuild (+27 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (29): FeedbackIssueStatusEnum, FeedbackIssueTypeEnum, FeedbackIssueDataModel, FeedbackIssueRelations, FeedbackIssueTable, InsertFeedbackIssue, insertFeedbackIssueSchema, SelectFeedbackIssue (+21 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (33): author, contributors, dependencies, drizzle-orm, nodemailer, react, react-dom, react-email (+25 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (33): author, contributors, devDependencies, eslint, glob, jsdom, nyc, @testing-library/dom (+25 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (33): author, contributors, devDependencies, babel-plugin-react-compiler, eslint, @next/env, @storybook/react-vite, @tailwindcss/postcss (+25 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (31): author, contributors, devDependencies, eslint, @storybook/react-vite, tailwindcss, @tailwindcss/postcss, @turbo/gen (+23 more)

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (24): ActionTypeEnumType, PermissionLevelEnumType, ResourceTypeEnumType, RoleEnumType, RoleTypeEnumType, InsertPermission, insertPermissionSchema, PermissionDataModel (+16 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (27): author, contributors, devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-only-warn, eslint-plugin-react (+19 more)

### Community 15 - "Community 15"
Cohesion: 0.08
Nodes (25): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, @fullcalendar/core, @fullcalendar/daygrid (+17 more)

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (22): import, import, types, types, import, types, exports, ./client (+14 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (18): ContactSubmissionStatusEnum, JobAssignmentRoleEnum, JobAssignmentStatusEnum, JobStatusEnum, LeadEstimateStatusEnum, LeadRevenueTypeEnum, LeadSourceEnum, LeadStatusEnum (+10 more)

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (10): useReplyFeedbackIssue(), useUpdateFeedbackIssueStatus(), FeedbackIssueDetailsContractType, metadata, metadata, FeedbackIssueDetails(), FeedbackIssueDetailsOutput, ReplyForm() (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.14
Nodes (13): createFeedbackIssueContract, CreateFeedbackIssueContractType, feedbackBaseContract, feedbackIssueDetailsContract, feedbackUserSchema, listFeedbackIssuesContract, ListFeedbackIssuesContractType, replyFeedbackIssueContract (+5 more)

### Community 20 - "Community 20"
Cohesion: 0.13
Nodes (15): devDependencies, dotenv, prettier, prettier-plugin-tailwindcss, @storybook/addon-vitest, @supabase/supabase-js, @trivago/prettier-plugin-sort-imports, tsx (+7 more)

### Community 21 - "Community 21"
Cohesion: 0.14
Nodes (13): ACTION_TYPE, CONTACT_SUBMISSION_STATUS, FEEDBACK_ISSUE_STATUS, FEEDBACK_ISSUE_TYPE, LEAD_ESTIMATE_STATUS, LEAD_REVENUE_TYPE, LEAD_SOURCE, NOTIFICATION_CATEGORY (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.21
Nodes (7): metadata, metadata, FeedbackStatusBadge(), FeedbackTypeBadge(), STATUS_VARIANTS, TYPE_VARIANTS, FeedbackIssueList()

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (13): import, require, types, exports, ./base, ./internal, ./ui, import (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.26
Nodes (9): feedbackContract, createFeedbackIssueProcedure, feedbackImpl, feedbackIssueDetailsProcedure, listFeedbackIssuesProcedure, replyFeedbackIssueProcedure, updateFeedbackIssueStatusProcedure, feedbackRouter (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.24
Nodes (9): useCreateFeedbackIssue(), CreateFeedbackIssueDialog(), ISSUE_TYPE_OPTIONS, FeedbackIssueCreateInput, feedbackIssueCreateSchema, FeedbackIssueReplyInput, feedbackIssueReplySchema, FeedbackIssueStatusUpdateInput (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.40
Nodes (4): adminSidebarMenuLinks, footerMenuLinks, settingsMenuLinks, sidebarMenuLinks

### Community 27 - "Community 27"
Cohesion: 0.50
Nodes (4): getSupportAgentIds(), notifySupportAgents(), NotifySupportAgentsProps, SUPPORT_AGENT_ROLES

## Knowledge Gaps
- **551 isolated node(s):** `name`, `version`, `type`, `private`, `author` (+546 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 3` to `Community 10`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `MailService` connect `Community 11` to `Community 2`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `exports` connect `Community 16` to `Community 1`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `name`, `version`, `type` to the rest of the system?**
  _551 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.038461538461538464 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05537098560354374 - nodes in this community are weakly interconnected._