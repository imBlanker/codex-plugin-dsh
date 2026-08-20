---
name: codex-rescue
description: Delegate a substantial, stuck, or heavy coding/debugging task to Codex when you (the DSH agent) are stuck, want a second implementation pass, or the user asks to hand work to Codex. Proactively usable for big delegation; do not grab simple asks.
---

# Codex Rescue (task delegation)

Hand a substantial task to Codex's task runtime as a background job.

## Steps

1. Compose a COMPLETE, self-contained task prompt. Codex cannot see this
   conversation: include the goal, relevant file paths, constraints, and
   the definition of done.
2. Run:

```bash
{{COMPANION}} task --background "<prompt>"
```

   Optional: `--write` to allow Codex to modify files; `--resume-last`
   to continue its previous task; `--model <model|spark>`; `--effort
   none|minimal|low|medium|high|xhigh`.
3. Report the job id to the user verbatim. The user can then ask for
   codex-status / codex-result / codex-cancel.

## Rules

- Default to `--background`; run foreground only if the user explicitly
  wants to wait (drop `--background`).
- Do not use this for trivial work you can finish quickly yourself.
