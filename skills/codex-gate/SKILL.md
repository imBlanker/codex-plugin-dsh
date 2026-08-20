---
name: codex-gate
description: Full-lifecycle Codex review gate (plan → realtime follow → completion). Toggle with gate on/off; run per-stage reviews when the gate is active or when the user asks to gate work. PASS auto-proceeds; FAIL requires replanning or fixes.
---

# Codex Review Gate (three stages)

The gate enforces: every task plans first, execution output is followed in
realtime, and completion is reviewed before delivery. Budgets: major stage
15min · minor stage 10min · other 1min · realtime ~30s. Effort/model per
call chosen by the OS-global learner (shared with the pi/cc plugins).

## Toggle & health

```bash
{{COMPANION}} gate on
{{COMPANION}} gate off
{{COMPANION}} gate status
{{COMPANION}} gate learner status
```

## Stage 1 — plan gate (before ANY execution)

1. Present your plan (goal, steps, files, risks) as a short structured text.
2. Run and return the verdict verbatim:

```bash
{{COMPANION}} gate plan --tier <major|minor|other> --json "<plan text>"
```

3. `verdict:"pass"` → proceed to execution. `verdict:"fail"` → address
   EVERY reason, revise the plan, re-run. Never start executing before PASS.

## Stage 2 — realtime follow (during execution)

For each long-running command (builds, test suites, installs), pipe output:

```bash
<command> 2>&1 | {{COMPANION}} gate follow --plan-file "$DSH_HOME/storages/codex-companion/gate-plan.md" --stdin --json
```

- `pass` → continue.
- `fail` (halt-chain) → STOP the current operation chain immediately, do
  not run further commands from the old plan; reorganize the solution
  (back to Stage 1 with a revised plan).

Persist the approved plan first: Stage 1 does this automatically.

## Stage 3 — completion gate (before declaring done / committing)

```bash
{{COMPANION}} gate completion --tier <tier> --diff --json
```

- `pass` → declare done; commit-like commands are allowed.
- `fail` → continue fixing per reasons; re-run Stage 3 after fixes.

## Rules

- Return verdict JSON verbatim; never soften FAIL reasons.
- FAIL loops are normal — replan, don't argue with the verdict.
- The gate is exempt from any price gating; latency is bounded by budgets
  (analysis times out fail-open by default).
