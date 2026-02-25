# OSQ Task Procedure

## Standard Flow (Per Issue)
1. Create/switch branch: `feat-[feature-name]-[issue-number]`
2. Implement only issue-scoped changes following existing design/system patterns.
3. Verify locally (targeted lint/test/build and manual route check).
4. Commit with issue reference.
5. Push branch to fork (`ziuus`).
6. Open PR from `ziuus:[branch]` -> `R3ACTR/main` (or upstream default).
7. Comment on issue with PR link and concise summary.
8. Update `status.md` and `task.md` with current outcome and next queued issue.

## Current Sprint Queue
- [x] #203 Copy Note to Clipboard (PR #217)
- [ ] #205 Workspace Settings
- [ ] #212 Search functionality
- [ ] #213 Export as Markdown
- [ ] #214 Multi-account support
