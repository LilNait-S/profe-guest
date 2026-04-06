# Skill: /implement — Execute plan tasks via agents

## Description
Orchestrates implementation by reading the task list (from `/plan`) and dispatching Implementer agents to do the work. Independent tasks run in parallel.

## Usage
```
/implement             — Start from first pending task
/implement <taskId>    — Implement a specific task
```

## Prerequisites
- Tasks must exist (from `/plan`)
- Project scaffolded (by `/init-project`)

## Instructions

### Step 1: Read context
1. Read `CLAUDE.md` for conventions
2. Read `.claude/agents/implementer.md` for the agent's instructions
3. Run TaskList — find pending tasks with no unresolved blockers

### Step 2: Dispatch agents

For each ready task (or group of independent tasks):

1. **Mark task(s) as in_progress**
2. **Launch Agent(s)** with `subagent_type: "general-purpose"`. In the prompt, include:
   - The full task description
   - The agent instructions from `.claude/agents/implementer.md`
   - Content from relevant docs (read them and paste into prompt)
   - Content from existing code the agent needs (types, lib files)
   - The CLAUDE.md conventions
3. **If tasks are independent** — launch multiple agents in parallel (single message, multiple Agent tool calls)
4. **If tasks depend on each other** — run sequentially, wait for result

### Step 3: After each agent completes
1. Verify the agent's output makes sense
2. Run `pnpm build` to confirm it compiles
3. Run `pnpm test` to confirm existing tests still pass
4. If build or tests fail, fix the issue or re-dispatch agent with error context
5. Mark task as completed

### Step 4: After all tasks
1. Final `pnpm build && pnpm test`
2. Show summary of implemented features
3. Suggest `/review` to verify conventions
4. Suggest `/sync-docs` to update feature tracking docs

## Agent prompt template

When launching an Implementer agent, use this structure:

```
You are an Implementer agent. Read these instructions carefully:

[paste .claude/agents/implementer.md content]

## Your task
[paste task subject and description]

## Project conventions
[paste CLAUDE.md content]

## Relevant docs
[paste relevant sections from docs/]

## Existing code context
[paste types/index.ts, lib/query-keys.ts, lib/api-client.ts, etc. as needed]

Implement the task. Run `pnpm build && pnpm test` when done to verify.
```

## Rules
- ALWAYS read the agent file before dispatching
- ALWAYS include CLAUDE.md conventions in agent prompts
- ALWAYS include existing code context (types, lib) so agents don't reinvent
- NEVER implement code yourself — delegate to agents
- Use `run_in_background: true` for parallel tasks when you have other work to do
