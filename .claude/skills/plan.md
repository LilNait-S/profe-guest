# Skill: /plan — Generate implementation plan via Planner agent

## Description
Launches a Planner agent that reads all docs and generates an ordered task list. The agent creates tasks with dependencies — ready for `/implement` to execute.

## Usage
```
/plan                  — Full plan from all docs
/plan <feature>        — Plan a specific feature (e.g., /plan payments)
```

## Prerequisites
All docs in `docs/` must exist. If missing, suggest `/docs` first.

## Instructions

### Step 1: Read context
1. Read `.claude/agents/planner.md` for the agent's instructions
2. Read `CLAUDE.md` for conventions
3. Read all files in `docs/`
4. List existing files in `src/` to know what's already implemented

### Step 2: Launch Planner agent

Launch a single Agent with `subagent_type: "general-purpose"`. In the prompt, include:
- The full agent instructions from `.claude/agents/planner.md`
- The CLAUDE.md conventions
- ALL docs content (read each file and paste)
- List of existing files in `src/` so the agent skips what's done
- Scope (full or specific feature based on args)

### Step 3: Present results
- Show the agent's plan table to the user
- Highlight which tasks can run in parallel
- Ask user to confirm before proceeding to `/implement`

## Agent prompt template

```
You are a Planner agent. Read these instructions carefully:

[paste .claude/agents/planner.md content]

## Project conventions
[paste CLAUDE.md content]

## Documentation
[paste all docs/ files]

## Already implemented
[paste file listing of src/]

## Scope
[full / specific feature]

Generate the implementation plan using TaskCreate. Present the summary table when done.
```

## Rules
- NEVER create tasks yourself — delegate to the agent
- ALWAYS include all docs in the agent prompt
- ALWAYS include existing file list so agent doesn't duplicate work
- Present the plan and wait for user confirmation before suggesting `/implement`
