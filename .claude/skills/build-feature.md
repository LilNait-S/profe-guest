# Skill: /build-feature — Full pipeline for a feature

## Description
End-to-end pipeline that takes a feature description and runs the entire workflow autonomously: plan → implement → polish → review → sync-docs. Only pauses for user approval on the plan.

## Usage
```
/build-feature <description>
```

## Examples
```
/build-feature Add edit lesson modal in calendar day sheet
/build-feature Create student detail page with lesson list and payment history
/build-feature Add search bar to student list page
```

## Instructions

### Phase 1: Plan
1. Read `CLAUDE.md`, `AGENTS.md`, and all `docs/` files
2. Read `.claude/agents/planner.md`
3. Scan existing code in `src/` to understand what exists
4. Launch a **Planner agent** with the feature description
5. Present the plan to the user and **wait for approval**
6. If the user requests changes, adjust the plan and re-present
7. Only proceed to Phase 2 after explicit user approval

### Phase 2: Implement
1. Read `.claude/agents/implementer.md`
2. For each task in the plan (in dependency order):
   - Launch **Implementer agent(s)** — parallel when tasks are independent
   - Each agent receives: task description, CLAUDE.md, relevant docs, existing code context
   - Each agent runs `pnpm build && pnpm test` when done
3. If build or tests fail, re-dispatch agent with error context
4. After all tasks complete, run final `pnpm build && pnpm test`

### Phase 3: Polish
1. Read `.claude/agents/ui-designer.md`
2. Identify which pages/components were created or modified in Phase 2
3. Launch **UI Designer agent(s)** for those files — parallel when independent
4. Each agent runs `pnpm build && pnpm test` when done
5. After all agents complete, run final `pnpm build && pnpm test`

### Phase 4: Review
1. Read `.claude/agents/reviewer.md`
2. Launch **Reviewer agent** with full scope
3. If ❌ errors found:
   - Auto-fix simple issues (missing imports, typos)
   - For complex issues, report to user and suggest fixes
4. Re-run `pnpm build && pnpm test` after any fixes

### Phase 5: Sync Docs
1. Read `.claude/agents/docs-sync.md`
2. Launch **Docs Sync agent** to update `docs/features/`
3. Show summary of doc changes

### Phase 6: Summary
Present final report:
```markdown
## Feature: [description]

### Implemented
- [list of files created/modified]

### Tests
- ✅ N tests pass (M new)

### Build
- ✅ Clean build

### Docs
- Updated: docs/features/[feature].md

### Next steps
- [any pending items or suggestions]
```

## Agent prompt templates

### Planner prompt
```
You are a Planner agent. Read these instructions carefully:

[paste .claude/agents/planner.md content]

## Feature to plan
[user's feature description]

## Project conventions
[paste CLAUDE.md content]

## Current docs
[paste relevant docs/]

## Existing code
[list of existing files in src/ relevant to this feature]

Generate the implementation plan.
```

### Implementer prompt
```
You are an Implementer agent. Read these instructions carefully:

[paste .claude/agents/implementer.md content]

## Your task
[specific task from the plan]

## Project conventions
[paste CLAUDE.md content]

## Existing code context
[paste relevant types, lib files, services]

Implement the task. Write tests for new utils/schemas. Run `pnpm build && pnpm test` when done.
```

### UI Designer prompt
```
You are a UI Designer agent. Read these instructions carefully:

[paste .claude/agents/ui-designer.md content]

## Files to polish
[paste current content of modified pages/components]

## Available shadcn/ui components
[list from src/components/ui/]

## Project conventions
[paste CLAUDE.md content]

Polish for mobile-first responsiveness and better UX. Run `pnpm build && pnpm test` when done.
```

## Rules
- ALWAYS pause for user approval after the plan (Phase 1)
- ALWAYS run `pnpm build && pnpm test` between phases
- If any phase fails, stop and report — don't continue with broken code
- Track progress with TodoWrite throughout the pipeline
- Launch parallel agents when tasks are independent
- NEVER skip the polish phase — every new page gets polished
- NEVER skip the review phase — every feature gets reviewed
