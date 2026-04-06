# Skill: /review — Verify implementation via Reviewer agent

## Description
Launches a Reviewer agent that checks build, tests, conventions, and code quality. Reports issues without fixing them.

## Usage
```
/review                — Full review (build + tests + conventions)
/review build          — Only build check
/review tests          — Only test check
/review conventions    — Only CLAUDE.md compliance
```

## Instructions

### Step 1: Read context
1. Read `.claude/agents/reviewer.md` for the agent's instructions
2. Read `CLAUDE.md` for conventions to check against

### Step 2: Launch Reviewer agent

Launch a single Agent with `subagent_type: "general-purpose"`. In the prompt, include:
- The full agent instructions from `.claude/agents/reviewer.md`
- The CLAUDE.md conventions
- The scope (full, build-only, tests-only, or conventions-only based on args)

### Step 3: Present results
- Show the agent's checklist report to the user
- If there are ❌ errors, suggest running `/implement` on specific files to fix them
- If there are ⚠️ missing tests, suggest adding them
- If everything passes, confirm the project is ready
- Suggest `/sync-docs` to keep feature docs up to date

## Agent prompt template

```
You are a Reviewer agent. Read these instructions carefully:

[paste .claude/agents/reviewer.md content]

## Project conventions to verify against
[paste CLAUDE.md content]

## Scope
[full / build-only / tests-only / conventions-only]

Run your checks and output the checklist report.
```

## Rules
- NEVER fix code yourself — only report via the agent
- Present the agent's report as-is to the user
- If the agent finds issues, suggest specific next steps
