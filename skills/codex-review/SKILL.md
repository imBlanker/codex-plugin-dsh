---
name: codex-review
description: Run a Codex code review against the current git state when the user asks for a review, a second opinion, or "用 codex 审查". Read-only — reports findings verbatim, never fixes them.
---

# Codex Review

Run a read-only Codex review of the current workspace's git state.

## Steps

1. Estimate the change size first (do not skip):
   - `git status --short --untracked-files=all`
   - `git diff --shortstat --cached` and `git diff --shortstat`
2. Ask the user ONE question in plain text: wait for the review to finish,
   or run it in the background? Recommend waiting only when the change is
   clearly tiny (≤2 files); otherwise recommend background.
3. Run the companion:

```bash
{{COMPANION}} review --wait
```

   Useful flags (pass through if the user gave them): `--base <ref>`,
   `--scope working-tree|branch|auto`. For background mode, run the same
   command without blocking the conversation, then tell the user to ask
   for the result via the codex-result skill later.

## Rules

- Return Codex's output VERBATIM in a fenced block. Do not paraphrase,
   summarize, or act on findings unless the user asks.
- This review is native-review only: no staged-only mode, no extra focus
   text. If the user wants a skeptical/custom review, use codex-adversarial-review instead.
- If Codex is not installed or not logged in, say so and point the user
  to the codex-setup skill.
