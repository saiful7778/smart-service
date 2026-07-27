# Graph Report - smart_service  (2026-07-28)

## Corpus Check
- 883 files · ~390,718 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 282 nodes · 299 edges · 44 communities (16 shown, 28 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ae096085`
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
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]

## God Nodes (most connected - your core abstractions)
1. `MailService` - 30 edges
2. `exports` - 14 edges
3. `scripts` - 4 edges
4. `scripts` - 4 edges
5. `publishConfig` - 2 edges
6. `IMailService` - 2 edges
7. `DataExportCompleteMailProps` - 2 edges
8. `DataExportCompleteMail()` - 2 edges
9. `WeeklySummaryMailProps` - 2 edges
10. `WeeklySummaryMail()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (44 total, 28 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (5): MaterialSelectorField(), MaterialSelectorFieldProps, MaterialSelectorFieldRenderProps, LeadEstimateFormProps, MaterialFieldProps

### Community 3 - "Community 3"
Cohesion: 0.50
Nodes (3): jobTableColumn, JobTableRowDataType, statusVariantMap

### Community 4 - "Community 4"
Cohesion: 0.50
Nodes (3): EstimateBinTableRowDataType, leadEstimateBinTableColumn, statusColorMap

### Community 6 - "Community 6"
Cohesion: 0.50
Nodes (3): EstimateTableRowDataType, leadEstimateTableColumn, statusColorMap

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (27): AccountLockedMailOptions, ContactSubmittedEmailOptions, DataExportCompleteMailOptions, EmailVerificationMailOptions, EstimateSentMailOptions, IntegrationConnectedMailOptions, IntegrationErrorMailOptions, InvoiceOverdueMailOptions (+19 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (17): ACTION_TYPE, CONTACT_SUBMISSION_STATUS, JOB_ASSIGNMENT_ROLE, JOB_ASSIGNMENT_STATUS, JOB_STATUS, LEAD_ESTIMATE_STATUS, LEAD_REVENUE_TYPE, LEAD_SOURCE (+9 more)

### Community 14 - "Community 14"
Cohesion: 0.20
Nodes (9): InsertLeadEstimate, insertLeadEstimateSchema, LeadEstimateDataModel, LeadEstimateRelations, LeadEstimateTable, SelectLeadEstimate, selectLeadEstimateSchema, UpdateLeadEstimate (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.08
Nodes (25): author, contributors, dependencies, @react-pdf/renderer, @workspace/lib, devDependencies, eslint, @types/node (+17 more)

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, exclude, extends, include

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (3): colors, EstimateData, styles

### Community 20 - "Community 20"
Cohesion: 0.50
Nodes (3): exclude, extends, include

### Community 41 - "Community 41"
Cohesion: 0.09
Nodes (21): author, contributors, devDependencies, eslint, @types/node, typescript, @upstash/redis, vitest (+13 more)

### Community 42 - "Community 42"
Cohesion: 0.14
Nodes (14): exports, ./logger, ./qstash, ./qstash/error, ./rate-limit, ./rate-limit/mock, ./redis, ./redis/mock (+6 more)

### Community 43 - "Community 43"
Cohesion: 0.25
Nodes (8): dependencies, drizzle-orm, pino, pino-pretty, @supabase/supabase-js, @upstash/qstash, @upstash/ratelimit, @workspace/drizzle

## Knowledge Gaps
- **144 isolated node(s):** `name`, `version`, `private`, `author`, `contributors` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MailService` connect `Community 10` to `Community 8`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `exports` connect `Community 42` to `Community 41`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 8` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Community 10` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Community 12` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Community 16` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._