# Skill: /sync-docs — Synchronize feature docs with codebase

## Description
Dispatches a Docs Sync agent that reads the codebase and updates `docs/features/` to match the actual implementation state. Code is the source of truth.

## Usage
```
/sync-docs              — Sync all feature docs
/sync-docs schedule     — Sync only schedule feature
/sync-docs auth         — Sync only auth feature
```

## When to use
- After completing a `/implement` or `/polish` pass
- After significant code changes
- Before presenting a status update to the user
- When the user asks "what's the current state?"

## Instructions

### Step 1: Read context
1. Read `.claude/agents/docs-sync.md` for the agent's instructions
2. Read all files in `docs/features/`
3. Determine scope (all features or specific one)

### Step 2: Launch Docs Sync agent

Launch a single Agent with `subagent_type: "general-purpose"`. In the prompt, include:
- The full agent instructions from `.claude/agents/docs-sync.md`
- The current content of each feature doc being synced
- The scope (all or specific feature)

### Step 3: Present results
- Show a diff summary of what changed
- Highlight any status changes (e.g., "schedule: in-progress → done")

## Agent prompt template

```
You are a Docs Sync agent. Read these instructions carefully:

[paste .claude/agents/docs-sync.md content]

## Current feature docs
[paste content of each docs/features/*.md file]

## Scope
[all / specific feature name]

Scan the codebase and update the feature docs to match. Code is the source of truth.
```

## Rules
- NEVER modify source code — docs only
- ALWAYS read code before updating docs
- Present changes as a summary to the user
