# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Agent Workflow

## Quick Start

```
/build-feature <descripcion de la feature>
```

That's it. One command runs the entire pipeline autonomously. Only pauses once to confirm the plan.

## Agents (5)

| Agent | File | Role | Writes code? |
|-------|------|------|-------------|
| **Planner** | `.claude/agents/planner.md` | Reads docs + code, generates ordered task plan | No |
| **Implementer** | `.claude/agents/implementer.md` | Executes tasks — writes services, API routes, pages, schemas, tests | Yes |
| **UI Designer** | `.claude/agents/ui-designer.md` | Polishes UI — responsive, shadcn tokens, mobile-first, empty states | Yes (visual only) |
| **Reviewer** | `.claude/agents/reviewer.md` | Audits build, tests, conventions. Reports issues | No |
| **Docs Sync** | `.claude/agents/docs-sync.md` | Syncs `docs/features/` with actual codebase state | Docs only |

## Skills (8)

| Skill | Description | Invokes |
|-------|-------------|---------|
| **`/build-feature`** | **Full pipeline** — plan → implement → polish → review → sync-docs | All agents |
| `/plan` | Generate implementation plan only | Planner |
| `/implement` | Execute plan tasks only | Implementer(s) |
| `/polish` | Polish UI/UX only | UI Designer(s) |
| `/review` | Audit code only | Reviewer |
| `/sync-docs` | Update feature docs only | Docs Sync |
| `/docs` | Generate initial MVP docs from problem.md | — |
| `/init-project` | Scaffold Next.js project | — |

## Pipeline: `/build-feature`

```
User: /build-feature Add edit lesson modal

  Phase 1: PLAN          → Planner agent creates task list
  ⏸️  User approves plan
  Phase 2: IMPLEMENT     → Implementer agents execute tasks (parallel when possible)
  Phase 3: POLISH        → UI Designer agents polish new/modified pages
  Phase 4: REVIEW        → Reviewer audits build + tests + conventions
  Phase 5: SYNC DOCS     → Docs Sync updates docs/features/
  ✅ Done                → Summary report
```

### Verification (autonomous, no browser needed)

Every agent that writes code verifies with:
```bash
pnpm build    # TypeScript compiles, routes resolve
pnpm test     # Vitest — utils, mappers, schemas, components
```

No preview server, no manual login, no browser dependency.

### When to use individual skills

- `/plan` — When you want to plan without implementing
- `/implement` — When the plan already exists and you want to resume
- `/polish` — When you want to polish existing pages without re-implementing
- `/review` — When you want a quick audit
- `/sync-docs` — When docs are stale

## Initial Setup Flow (one-time)

```
/docs → /init-project → /build-feature <first feature>
```
