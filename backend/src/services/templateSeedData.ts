import { ITemplatePlaceholder, TemplateCategory, TemplateVisibility } from '../models/Template';

export interface BuiltInTemplate {
  title: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  body: string;
  placeholders: ITemplatePlaceholder[];
  visibility: TemplateVisibility;
  isBuiltIn: true;
}

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    title: 'Meeting Notes',
    description:
      'Structured format for recording meeting discussions, decisions, and action items. Ideal for recurring standups, planning sessions, and reviews.',
    category: 'meeting',
    tags: ['meeting', 'standup', 'collaboration'],
    visibility: 'public',
    isBuiltIn: true,
    placeholders: [
      { name: 'date', label: 'Meeting Date', type: 'date', required: true, defaultValue: '', description: 'Date the meeting was held' },
      { name: 'attendees', label: 'Attendees', type: 'list', required: true, defaultValue: '', description: 'Comma-separated list of participants' },
      { name: 'facilitator', label: 'Facilitator', type: 'text', required: false, defaultValue: '', description: 'Meeting facilitator name' },
    ],
    body: `# Meeting Notes — {{date}}

**Facilitator:** {{facilitator}}
**Attendees:** {{attendees}}

---

## 📋 Agenda

1. 
2. 
3. 

---

## 📝 Discussion

### Topic 1


### Topic 2


### Topic 3


---

## ✅ Decisions Made

- 

---

## 🎯 Action Items

| # | Task | Owner | Due Date | Status |
|---|------|-------|----------|--------|
| 1 |  |  |  | 🔲 Open |
| 2 |  |  |  | 🔲 Open |

---

## 📌 Next Meeting

**Date:** 
**Topics to carry forward:**
- 

---

*Notes recorded by: {{facilitator}}*
`,
  },

  {
    title: 'RFC — Request for Comments',
    description:
      'Formal proposal format for discussing significant technical or product decisions with stakeholders before implementation begins.',
    category: 'rfc',
    tags: ['rfc', 'proposal', 'technical', 'decision'],
    visibility: 'public',
    isBuiltIn: true,
    placeholders: [
      { name: 'rfc_number', label: 'RFC Number', type: 'number', required: true, defaultValue: '', description: 'Sequential RFC identifier' },
      { name: 'title', label: 'RFC Title', type: 'text', required: true, defaultValue: '', description: 'Short, descriptive title for the proposal' },
      { name: 'author', label: 'Author(s)', type: 'text', required: true, defaultValue: '', description: 'Primary author(s) of this RFC' },
      { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: '', description: 'Submission date' },
    ],
    body: `# RFC-{{rfc_number}}: {{title}}

**Author:** {{author}}
**Date:** {{date}}
**Status:** \`Draft\` <!-- Draft | In Review | Accepted | Rejected | Superseded -->

---

## Summary

> _A one-paragraph summary of the proposal. What is it, and why does it matter?_

---

## Motivation

### Problem Statement

_Describe the problem this RFC is solving. Why do we need this change?_

### Goals

- 
- 

### Non-Goals

- 

---

## Detailed Design

_Provide the full technical or design specification. Include diagrams, API contracts, data models, or user flows as appropriate._

### Proposed Solution


### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Option A |  |  |
| Option B (proposed) |  |  |

---

## Implementation Plan

### Phases

1. **Phase 1** — 
2. **Phase 2** — 
3. **Phase 3** — 

### Estimated Effort

| Area | Estimate |
|------|----------|
| Backend |  |
| Frontend |  |
| Testing |  |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
|  | Medium | High |  |

---

## Open Questions

- [ ] 
- [ ] 

---

## References

- 
- 

---

*RFC status changes and comments should be tracked in the discussion thread below this document.*
`,
  },

  {
    title: 'Architecture Decision Record (ADR)',
    description:
      'Capture architectural decisions and their context. Helps teams understand why design choices were made, especially for future reference.',
    category: 'design',
    tags: ['adr', 'architecture', 'design', 'decision'],
    visibility: 'public',
    isBuiltIn: true,
    placeholders: [
      { name: 'adr_number', label: 'ADR Number', type: 'number', required: true, defaultValue: '', description: 'Sequential ADR identifier' },
      { name: 'title', label: 'Decision Title', type: 'text', required: true, defaultValue: '', description: 'Short title for the decision' },
      { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: '', description: 'Decision date' },
      { name: 'deciders', label: 'Deciders', type: 'list', required: true, defaultValue: '', description: 'People involved in making this decision' },
    ],
    body: `# ADR-{{adr_number}}: {{title}}

**Date:** {{date}}
**Status:** \`Proposed\` <!-- Proposed | Accepted | Deprecated | Superseded by ADR-XXX -->
**Deciders:** {{deciders}}

---

## Context

_Describe the forces at play — technical, political, social, and project-specific. These forces are probably in tension, and should be named._


---

## Decision

_The change that we're proposing or have agreed to implement, stated clearly and concisely._


---

## Consequences

### Positive

- 

### Negative

- 

### Neutral

- 

---

## Options Considered

### Option 1 (Selected): 

**Pros:**
- 

**Cons:**
- 

### Option 2: 

**Pros:**
- 

**Cons:**
- 

---

## Implementation Notes

_Any technical notes or considerations for teams implementing this decision._

---

*This ADR supersedes: N/A*
*This ADR is superseded by: N/A*
`,
  },

  {
    title: 'Bug Report',
    description:
      'Comprehensive bug report format for engineering teams. Captures reproduction steps, environment details, expected vs actual behaviour, and links to related work.',
    category: 'bug_report',
    tags: ['bug', 'defect', 'engineering', 'qa'],
    visibility: 'public',
    isBuiltIn: true,
    placeholders: [
      { name: 'bug_id', label: 'Bug / Ticket ID', type: 'text', required: false, defaultValue: '', description: 'Reference ID from your issue tracker' },
      { name: 'reporter', label: 'Reported By', type: 'text', required: true, defaultValue: '', description: 'Name of the person reporting' },
      { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: '', description: 'Date this was reported' },
    ],
    body: `# Bug Report — {{bug_id}}

**Reported By:** {{reporter}}
**Date:** {{date}}
**Severity:** \`Critical\` <!-- Critical | High | Medium | Low -->
**Priority:** \`P1\` <!-- P1 | P2 | P3 | P4 -->
**Status:** \`Open\` <!-- Open | In Progress | Resolved | Won't Fix | Duplicate -->

---

## Summary

_One-line description of the bug._

---

## Environment

| Field | Value |
|-------|-------|
| OS | |
| Browser / Client | |
| App Version | |
| Environment | Production / Staging / Dev |
| User Role | |

---

## Steps to Reproduce

1. 
2. 
3. 
4. 

---

## Expected Behaviour

_What should happen?_

---

## Actual Behaviour

_What actually happens?_

---

## Screenshots / Logs

_Attach screenshots, video recordings, or relevant log snippets._

\`\`\`
Paste error logs here
\`\`\`

---

## Root Cause Analysis

_Once investigated, document the root cause here._

---

## Proposed Fix

_Optional: If you have a suggested fix, describe it here._

---

## Related Issues / PRs

- 
`,
  },

  {
    title: 'Sprint Planning',
    description:
      'Organise sprint goals, capacity, and task breakdowns. Provides a single source of truth for the team during the sprint.',
    category: 'sprint',
    tags: ['agile', 'sprint', 'planning', 'engineering'],
    visibility: 'public',
    isBuiltIn: true,
    placeholders: [
      { name: 'sprint_number', label: 'Sprint Number', type: 'number', required: true, defaultValue: '', description: 'Sprint iteration number' },
      { name: 'start_date', label: 'Sprint Start', type: 'date', required: true, defaultValue: '', description: 'Sprint start date' },
      { name: 'end_date', label: 'Sprint End', type: 'date', required: true, defaultValue: '', description: 'Sprint end date' },
      { name: 'team', label: 'Team Members', type: 'list', required: true, defaultValue: '', description: 'Comma-separated team members' },
    ],
    body: `# Sprint {{sprint_number}} Planning

**Period:** {{start_date}} → {{end_date}}
**Team:** {{team}}

---

## 🎯 Sprint Goal

_A single, concise statement describing what success looks like at the end of this sprint._

---

## 📊 Capacity

| Team Member | Available Days | Story Points |
|-------------|---------------|-------------|
|  |  |  |
|  |  |  |
| **Total** | | |

---

## 📋 Sprint Backlog

### Must-Have (P0)

| ID | Title | Assignee | Points | Status |
|----|-------|----------|--------|--------|
|  |  |  |  | 🔲 To Do |
|  |  |  |  | 🔲 To Do |

### Should-Have (P1)

| ID | Title | Assignee | Points | Status |
|----|-------|----------|--------|--------|
|  |  |  |  | 🔲 To Do |

### Nice-to-Have (P2)

| ID | Title | Assignee | Points | Status |
|----|-------|----------|--------|--------|
|  |  |  |  | 🔲 To Do |

---

## 🚧 Dependencies & Blockers

- 

---

## 📝 Notes & Agreements

- 

---

## Definition of Done

- [ ] Code reviewed and approved
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Acceptance criteria met
`,
  },

  {
    title: 'Project Brief',
    description:
      'High-level project overview for aligning stakeholders on scope, objectives, and timelines at the start of a new initiative.',
    category: 'project',
    tags: ['project', 'brief', 'planning', 'stakeholders'],
    visibility: 'public',
    isBuiltIn: true,
    placeholders: [
      { name: 'project_name', label: 'Project Name', type: 'text', required: true, defaultValue: '', description: 'Official project name' },
      { name: 'owner', label: 'Project Owner', type: 'text', required: true, defaultValue: '', description: 'DRI / Project Owner' },
      { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: '', description: 'Brief creation date' },
    ],
    body: `# Project Brief: {{project_name}}

**Owner:** {{owner}}
**Date:** {{date}}
**Phase:** \`Discovery\` <!-- Discovery | Planning | Execution | Review | Closed -->

---

## Executive Summary

_2–3 sentences describing what this project is and why it's being done now._

---

## Problem Statement

_What problem or opportunity does this project address?_

---

## Objectives & Success Metrics

| Objective | Key Result / Metric | Target |
|-----------|--------------------|---------| 
|  |  |  |
|  |  |  |

---

## Scope

### In Scope
- 

### Out of Scope
- 

---

## Stakeholders

| Name | Role | Involvement |
|------|------|-------------|
|  | Sponsor | Approver |
|  | PM | DRI |
|  | Engineering | Core Team |

---

## Timeline

| Milestone | Target Date | Status |
|-----------|------------|--------|
| Kickoff |  | 🔲 |
| Design complete |  | 🔲 |
| Build complete |  | 🔲 |
| Launch |  | 🔲 |

---

## Budget / Resources

_Resources required: headcount, tools, infrastructure estimate._

---

## Risks

| Risk | Likelihood | Impact | Owner |
|------|-----------|--------|-------|
|  | Medium | High |  |

---

## Open Questions

- [ ] 
- [ ] 
`,
  },

  {
    title: 'Retrospective',
    description:
      'Post-sprint or post-project retrospective to reflect on what went well, what didn\'t, and what to improve. Based on the Start / Stop / Continue format.',
    category: 'retrospective',
    tags: ['retro', 'agile', 'retrospective', 'team'],
    visibility: 'public',
    isBuiltIn: true,
    placeholders: [
      { name: 'sprint_or_project', label: 'Sprint / Project', type: 'text', required: true, defaultValue: '', description: 'Sprint number or project name' },
      { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: '', description: 'Retro date' },
      { name: 'facilitator', label: 'Facilitator', type: 'text', required: false, defaultValue: '', description: 'Facilitator name' },
    ],
    body: `# Retrospective — {{sprint_or_project}}

**Date:** {{date}}
**Facilitator:** {{facilitator}}

---

## ✅ What Went Well (Keep Doing)

_Practices, decisions, or behaviours the team should continue._

- 
- 

---

## ❌ What Didn't Go Well (Stop Doing)

_Things that hindered progress or caused friction._

- 
- 

---

## 💡 What Should We Try (Start Doing)

_New ideas, experiments, or process changes to attempt._

- 
- 

---

## 🎯 Action Items

| # | Action | Owner | Due | Status |
|---|--------|-------|-----|--------|
| 1 |  |  |  | 🔲 |
| 2 |  |  |  | 🔲 |

---

## 📊 Team Metrics (Optional)

| Metric | This Sprint | Last Sprint | Trend |
|--------|-------------|-------------|-------|
| Velocity |  |  | |
| Bug count |  |  | |
| Deploy frequency |  |  | |

---

## 😊 Team Mood

_Rate team morale 1–5 and note key factors._

**Score:** /5
**Factors:**
- 
`,
  },

  {
    title: 'Research Notes',
    description:
      'Structured template for documenting research findings, sources, and insights. Suitable for user research, competitive analysis, or technical exploration.',
    category: 'research',
    tags: ['research', 'notes', 'discovery', 'analysis'],
    visibility: 'public',
    isBuiltIn: true,
    placeholders: [
      { name: 'topic', label: 'Research Topic', type: 'text', required: true, defaultValue: '', description: 'The subject of research' },
      { name: 'researcher', label: 'Researcher', type: 'text', required: true, defaultValue: '', description: 'Name of researcher' },
      { name: 'date', label: 'Date', type: 'date', required: true, defaultValue: '', description: 'Research date' },
    ],
    body: `# Research Notes: {{topic}}

**Researcher:** {{researcher}}
**Date:** {{date}}
**Status:** \`In Progress\` <!-- In Progress | Complete | Archived -->

---

## Research Question(s)

1. 
2. 

---

## Methodology

_How was this research conducted? (desk research, interviews, surveys, analysis, experiments)_

---

## Key Findings

### Finding 1



### Finding 2



### Finding 3



---

## Supporting Evidence

| Finding | Source | Quote / Data |
|---------|--------|--------------|
|  |  |  |
|  |  |  |

---

## Patterns & Insights

_What patterns emerged? What does this mean for the team or product?_

-  

---

## Gaps & Open Questions

_What questions remain unanswered? What research is needed next?_

- [ ] 
- [ ] 

---

## References

| # | Source | Link | Date Accessed |
|---|--------|------|---------------|
| 1 |  |  |  |
| 2 |  |  |  |

---

## Recommendations

_Based on the research, what do you recommend?_

1. 
2. 
`,
  },
];
