# Claude Code – Session Rules for notes-

## 1. Always Use Subagents for Isolated Tasks

Every session must delegate isolated, heavy, or exploratory work to subagents so the main context stays lean.

**Rule**: Before reading large files, searching broadly, or running multi-step investigations, spawn a subagent.

**How**:
- File review / edge-case audit → subagent
- Web search for API docs → subagent
- Linting, testing, build validation → subagent
- Documentation generation → subagent (use Haiku)
- Routine file listing / grep → subagent (use Sonnet)

**Model selection**:
| Task | Model |
|------|-------|
| Complex reasoning / architecture | Opus |
| Code review, debugging, implementation | Sonnet (default) |
| Docs, listing, routine search | Haiku |

Only the subagent's final summary is returned to the main session — not all intermediate tool output.

---

## 2. Enable Agent Teams for Parallel Work

For multi-module tasks (e.g., refactor + update docs, or test multiple features), assemble an agent team.

**Activation** (already set in `.claude/settings.json`):
```
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

**How to invoke**: Prompt like:
> "Assemble a team to refactor the Gemini service and update the README simultaneously."

Each teammate runs in its own context window — the parent session carries only the summary.

---

## 3. Proactive Context Management

Apply these rules every session:

- **After each subagent completes**: run `/compact` to compress history.
- **When switching to an unrelated task**: run `/clear`.
- **Prompts must be concise**: "Audit `src/services/gemini.ts` for bugs. Show only changed lines."
- **Lazy loading**: skill frontmatter uses `disable-model-invocation: true` where applicable so skills aren't loaded into context until triggered.

---

## Project Stack (quick reference)

- React 19 + TypeScript + Vite + Tailwind CSS
- Google Gemini API (`@google/genai`)
- D3.js mind map, Framer Motion, React Markdown
- Express backend (SQLite via `better-sqlite3`)

## Key Files

| File | Purpose |
|------|---------|
| `src/services/gemini.ts` | All Gemini API calls |
| `src/App.tsx` | Root component |
| `src/types.ts` | Shared TypeScript types |
| `src/components/` | Feature components |
