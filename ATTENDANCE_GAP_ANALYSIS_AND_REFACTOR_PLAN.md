# Attendance Gap Analysis And Refactor Plan

Date: 2026-07-08
Status: Architecture Review
Scope: Compare the current implementation to ATTENDANCE_PASTORAL_CARE_ARCHITECTURE.md and define a phased refactor plan.

## Summary

The current implementation is a useful intermediate step, but it is still shaped primarily like an extended CRUD flow rather than an operational pastoral workflow.

What exists today is strong enough to preserve as a foundation:

- Attendance submission exists.
- Attendance statuses exist.
- A church-facing Attendance screen exists.
- Follow-up creation exists.
- Service-scoped attendance fetching exists.
- Basic care linkage between Attendance and CareFollowUp exists.

However, the system does not yet behave like the target architecture.

The main gap is conceptual:

- The current system still treats pastoral care as a follow-up record.
- The target architecture requires a case-management workflow.
- The current dashboard still presents raw attendance states instead of operational signals.
- The current UI supports filtering, but not true triage, ownership, or resolution workflow.

This document recommends preserving the existing implementation as a base and refactoring in small phases.

## 1. What Is Already Correct And Should Be Kept

### Attendance Domain Foundation

These parts are already useful and should remain as the base layer:

- Attendance records support service-linked submission.
- Attendance status enums already cover key pastoral states such as Present, Online, Absent, Sick, Needs Prayer, Travelling, and Working.
- Attendance supports `message` and `wantsPastorContact`, which are essential signal inputs.
- Attendance is already linked to service, member, and user context.
- Duplicate submission prevention per service is already present.

### Attendance Dashboard Foundation

The current dashboard has a valid structural starting point:

- Sidebar navigation already exposes Attendance as a top-level church module.
- Service selection already exists.
- Status-level aggregate filtering already exists.
- Attendance rows already show member, attendance state, response text, and follow-up presence.
- Row actions already allow pastoral work to begin from the Attendance context.

### Care Data Foundation

These parts should be preserved rather than replaced outright:

- CareFollowUp already links to Attendance through `attendanceId`.
- Assigned ownership already exists through `assignedTo`.
- Priority already exists.
- A minimal status lifecycle already exists: Open, Contacted, Visited, Closed.
- Follow-up records are already queryable and paginated.

### Refactor Strategy Foundation

The current codebase can support incremental evolution because:

- Attendance and care are already separated into models and services.
- The Attendance page is already isolated enough to refactor independently.
- Service-scoped statistics are already implemented.
- Follow-up creation from Attendance already demonstrates the correct product direction, even if the model is not mature enough.

## 2. What Does Not Match The New Architecture

### Dashboard Purpose Mismatch

The target architecture defines Attendance as an Operations Dashboard.

The current implementation is still closer to:

- a status-filtered table
- with follow-up creation
- but without operational triage depth

What is missing:

- KPI cards
- operational queues
- attention prioritization
- owner workload visibility
- open case visibility
- stale case visibility
- expected-member calculations

### Care Signal Mismatch

The new architecture requires a calculated Care Signal with levels such as:

- No Action
- Review
- Needs Care
- Urgent

The current system uses a simpler `Care Required` label:

- Yes
- Review
- Optional
- No

This is useful as a temporary heuristic, but it is not the same thing as a formal care-signal engine.

Current limitations:

- no calculated urgency model
- no use of historical attendance patterns
- no repeated absence detection
- no unresolved-case escalation logic
- no message keyword interpretation
- no manual staff override layer

### Case Management Mismatch

The architecture recommends a case-management model.

The current implementation is still a single-record follow-up workflow.

What is missing:

- true case identity and case workspace
- multi-step lifecycle beyond a lightweight status field
- resolution outcome model
- reopen/escalation behavior
- activity timeline
- action audit trail
- last action visibility
- next action or due-date management
- assignment workload tracking

### Member Context Mismatch

The architecture expects Attendance to open a richer Member Detail workspace.

The current Attendance screen does not yet provide:

- Overview tab
- Attendance history tab from the dashboard path
- Prayer Requests tab
- Pastoral Care tab
- Departments context
- Giving context
- Events context
- Notes context

The current implementation is therefore operationally shallow at the moment a leader needs more context.

### Service Selection Mismatch

The architecture recommends service cards where service count is manageable.

The current system uses simple buttons/chips only.

What is missing:

- service attendance rate
- open care case count per service
- live/upcoming/completed context
- service-level operational summary

### Table Design Mismatch

The architecture recommends a table designed around decisions.

The current table still lacks:

- Care Signal column
n- Owner column
- Last Action column
- direct member detail entry
- clear distinction between attendance state and pastoral urgency

The existing `Follow-up` column is helpful but still too narrow for the future case-based workflow.

### Timeline Mismatch

The architecture requires every pastoral action to be recorded.

The current implementation does not store:

- Case Created event
- Assigned event
- phone call logs
- message logs
- visit logs
- prayer-completed logs
- reopen logs
- resolution summary logs

This is a major product gap because pastoral care without timeline history cannot become a real operational system.

## 3. What Should Be Renamed

### Primary Rename Recommendation

`CareFollowUp` should be renamed to `CareCase`.

Reason:

- “Follow-up” sounds like a single action.
- “Case” better represents ownership, continuity, status, activity history, and closure.
- The new architecture is fundamentally case management, not follow-up logging.

### Alternative Naming Option

`PastoralCareCase`

Use this only if the domain needs to be explicit and if the project contains other types of cases later.

### Preferred Final Naming

Recommended canonical naming:

- Model: `CareCase`
- Module label in UI: `Pastoral Care`
- Screen names: `Open Cases`, `Assigned Cases`, `Resolved Cases`

This gives a balance:

- technical model naming stays compact
- user-facing naming stays pastoral and understandable

### Additional Rename Recommendations

- `Care Required` should become `Care Signal`
- `Follow-up` column should become `Care Case`
- `Add Follow-up` should become `Create Case`
- `View Follow-up` should become `Open Case`
- `Assigned To` should become `Case Owner`
- `Reason` should remain but eventually distinguish `source reason` from `case category`

## 4. What UI Changes Are Needed

### Attendance Screen

The current Attendance screen should be refactored from a filter page into an operational dashboard.

Needed changes:

- Add KPI cards at the top.
- Replace service chips/buttons with service cards where possible.
- Replace raw summary chips with operational summary chips.
- Add an “Attention Required” view.
- Add an “Open Cases” view.
- Allow quick drill-down from KPI cards into filtered table states.

### Attendance Table

Refactor the table to the following operational columns:

- Member
- Attendance Outcome
- Response Summary
- Care Signal
- Care Case
- Owner
- Last Action
- Actions

Changes needed:

- Remove the current `Care Required` label as the main decision field.
- Replace it with calculated Care Signal.
- Add owner visibility.
- Add last pastoral action visibility.
- Add member detail entry from the member name.

### Row Actions

Needed action set over time:

- Open Member
- Create Case
- Open Case
- Assign Case
- Log Contact
- Resolve Case

Current row actions are acceptable for Phase 1, but insufficient beyond that.

### Care Drawer / Side Panel

The current offcanvas is useful as a temporary pattern and should be preserved as an interaction style.

But its purpose should evolve from:

- simple follow-up creation

to:

- case intake
- assignment
- action logging
- resolution updates

### Member Detail UX

The Attendance workflow needs a proper Member Detail entry point.

Required future UI:

- Overview
- Attendance
- Prayer Requests
- Pastoral Care
- Departments
- Giving
- Events
- Notes

### Dashboard Widgets

Future UI widgets needed:

- Members absent three consecutive services
- Members requesting prayer today
- Cases waiting for first contact
- Open cases by owner
- Hospital/home visits this week
- Assigned to me
- Recently resolved cases

## 5. What Backend Changes Are Needed

### Attendance Service Layer

Keep the current attendance service foundation, but extend it to support operations.

Needed additions:

- expected-members calculation per service
- absent-without-submission calculation
- care-signal calculation service
- repeated absence detection
- service dashboard aggregate endpoint
- member-risk scoring hooks

### Care Case Service Layer

The current CareFollowUp service should evolve into a CareCase service.

Needed additions:

- lifecycle transitions with validation
- owner assignment workflows
- resolution outcomes
- reopen/escalate behavior
- case source metadata
- case due dates / next action dates
- dashboard counts by status and owner

### Timeline / Activity Service

A new service layer is needed for activity events.

Needed capabilities:

- create timeline event
- fetch case timeline
- summarize latest action
- record contact channel
- record visit outcomes
- record prayer completion

### API Layer

New or refactored API surfaces will be needed for:

- attendance dashboard KPIs
- care signal summaries
- open care cases by service
- case lifecycle transitions
- case activities timeline
- assigned workload views
- member-detail pastoral context

## 6. What Database Changes Are Needed

### Attendance Model

Keep the current Attendance model, but extend carefully rather than replacing it.

Likely additions later:

- normalized signal fields or derived-signal snapshots
- expected cohort reference if service segmentation is introduced
- attendance classification metadata
- signal explanation metadata if auditability is needed

### CareFollowUp / CareCase Model

Current model is not yet rich enough for the architecture.

Needed additions:

- rename to `CareCase`
- case number or human-readable identifier
- source type
- source reason
- lifecycle status beyond current lightweight enum
- resolution outcome
- openedAt
- assignedAt
- firstContactAt
- resolvedAt
- closedAt
- nextActionAt
- escalation level
- optional campus/team ownership later

### New Activity Timeline Model

A dedicated model should be introduced later.

Suggested entity: `CareCaseActivity`

Fields should include:

- caseId
- memberId
- actorId
- eventType
- channel
- summary
- outcome
- metadata
- createdAt

### Optional Supporting Models Later

Can wait until later phases:

- prayer request entity if separated from attendance
- case resolution outcome dictionary
- vulnerability tags or member care profile
- AI recommendation snapshot entity

## 7. What Should Be Removed Or Simplified

### Remove Or De-emphasize

- Treating Attendance as a CRUD-first screen
- Treating follow-up creation as the final pastoral workflow
- Using raw status chips as the main operational lens
- Over-relying on status badges without calculated signals
- Mixing attendance state and care urgency into one simplistic label

### Simplify In The Short Term

- Keep the current attendance table, but simplify the number of temporary labels
- Avoid building many separate care screens before the case model is settled
- Do not add complex AI or predictive logic before case workflow and timeline exist
- Do not introduce too many new enums at once without lifecycle boundaries

## 8. What Can Wait Until Later

These items are important, but should not block the first architectural correction:

- AI recommendations
- advanced keyword analysis for messages
- multi-campus routing
- SLA metrics
- pastoral workload balancing automation
- giving and events integration into member detail
- predictive disengagement scoring
- communication-channel integrations like WhatsApp or SMS
- department-aware expected attendance forecasting

These should follow after the operational model is stable.

## 9. Phased Implementation Plan

The system should not be rebuilt in one pass.

### Phase 1: Fix Attendance Dashboard Flow And Labels

Goal:
Bring the current Attendance dashboard into alignment with the new product language and operational intent.

Scope:

- Rename user-facing Follow-up language toward Case / Pastoral Care terminology where safe.
- Replace `Care Required` with `Care Signal` in the UI.
- Introduce calculated care-signal labels using existing attendance data.
- Add KPI cards for:
  - Expected Members
  - Attendance Submitted
  - Need Attention
  - Open Care Cases
- Improve service selection presentation.
- Improve status summaries to emphasize operational states.
- Add member-detail entry from the table.

Keep:

- current attendance storage
- current linked follow-up creation flow
- current offcanvas pattern

Outcome:
Attendance becomes a more credible operations dashboard without large backend disruption.

### Phase 2: Improve CareFollowUp Into Care Cases

Goal:
Refactor the current follow-up concept into a true care-case domain.

Scope:

- Rename model/service/API and UI language from CareFollowUp to CareCase / Pastoral Care.
- Add clearer case fields for source, owner, open date, and resolution data.
- Separate attendance state from case state.
- Add dedicated case views:
  - Open Cases
  - Assigned To Me
  - Resolved Cases

Outcome:
Pastoral work becomes a persistent workflow instead of a lightweight appendage to attendance.

### Phase 3: Add Case Lifecycle And Activity Timeline

Goal:
Turn each case into a traceable pastoral process.

Scope:

- Add lifecycle transitions:
  - Open
  - Assigned
  - Contacted
  - Visited
  - Resolved
  - Closed
- Add timeline events for calls, messages, visits, prayer, notes, reassignment, and closure.
- Add Last Action and Next Action capabilities.
- Expose timeline in the case workspace.

Outcome:
The system can now support accountability, continuity, and pastoral reporting.

### Phase 4: Add Member Detail Context

Goal:
Ensure Attendance and Pastoral Care actions happen with enough member context.

Scope:

- Build Member Detail entry from Attendance.
- Add tabs:
  - Overview
  - Attendance
  - Prayer Requests
  - Pastoral Care
  - Departments
  - Giving
  - Events
  - Notes
- Surface open case history and prayer context in one place.

Outcome:
Leaders can make informed decisions without leaving the workflow blind.

### Phase 5: Add AI Insights Later

Goal:
Layer intelligence onto a stable workflow.

Scope:

- attendance anomaly detection
- disengagement risk suggestions
- care priority suggestions
- prayer-request clustering
- recommended next actions

Guardrail:
AI should recommend, not automate pastoral judgment.

Outcome:
AI amplifies the operational model only after the human workflow is mature.

## Final Recommendation

Do not discard the current implementation.

It already provides the right technical footholds:

- attendance capture
- service context
- pastoral intent signals
- linked care records
- church-facing dashboard entry point

But do not continue extending it as if it were already the final architecture.

The next step should be controlled refactoring around product meaning:

- Attendance becomes the weekly operations centre.
- Care Follow-up becomes Care Cases.
- Simple labels become calculated care signals.
- Follow-up records become lifecycle-managed cases.
- Attendance rows become decision rows.
- Pastoral actions become timeline events.

Recommended execution order:

1. Fix dashboard flow and terminology.
2. Refactor follow-up into care cases.
3. Add lifecycle and activity timeline.
4. Add member context.
5. Add AI later.

This preserves momentum while moving the system toward the architecture defined in ATTENDANCE_PASTORAL_CARE_ARCHITECTURE.md.
