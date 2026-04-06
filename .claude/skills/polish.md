# Skill: /polish — Improve UI/UX and responsiveness

## Description
Dispatches UI Designer agents to polish pages and components. Improves visual quality, mobile responsiveness, and shadcn/ui usage without touching business logic.

## Usage
```
/polish                    — Polish all pages in (protected)/
/polish students           — Polish only the students pages
/polish payments           — Polish only the payments pages
/polish src/app/(protected)/page.tsx  — Polish a specific file
```

## Prerequisites
- Pages must already be implemented and working
- Run `/implement` first if pages don't exist yet

## Instructions

### Step 1: Read context
1. Read `CLAUDE.md` for conventions
2. Read `.claude/agents/ui-designer.md` for the agent's instructions
3. List available shadcn/ui components: `ls src/components/ui/`
4. Identify target files based on the user's argument:
   - No argument: all pages in `src/app/(protected)/`
   - Entity name: all pages under that entity folder
   - Specific path: just that file

### Step 2: Group and dispatch agents

Group files by page/feature (each agent handles one page or closely related group):

1. **Mark work as in_progress** via TodoWrite
2. **Launch Agent(s)** with `subagent_type: "general-purpose"`. In the prompt, include:
   - The full agent instructions from `.claude/agents/ui-designer.md`
   - The list of files to polish (read their current content and paste it)
   - The available shadcn/ui components
   - The CLAUDE.md conventions
   - The current `globals.css` theme setup
3. **Independent pages can run in parallel** (students and payments pages don't depend on each other)

### Step 3: After each agent completes
1. Run `pnpm build` to confirm it still compiles
2. Run `pnpm test` to confirm existing tests still pass
3. If build or tests fail, fix or re-dispatch with error context
4. Mark as completed

### Step 4: After all agents
1. Final `pnpm build && pnpm test`
2. Show summary of what was improved
3. Suggest `/review` to verify nothing broke

## Agent prompt template

```
You are a UI Designer agent. Read these instructions carefully:

[paste .claude/agents/ui-designer.md content]

## Files to polish
[paste the current content of each target file]

## Available shadcn/ui components
[list installed components from src/components/ui/]

## Theme setup
[paste globals.css content]

## Project conventions
[paste CLAUDE.md content]

Polish these files for mobile-first responsiveness and better UX. Run `pnpm build && pnpm test` when done.
```

## Rules
- ALWAYS read the agent file before dispatching
- ALWAYS include the current file contents so the agent has full context
- NEVER change business logic — this is visual-only
- NEVER dispatch for API routes or service files — only pages and components
- If a page needs a shadcn component that's not installed, the agent will install it
- After polish, suggest `/review` to verify nothing broke
