---
name: codex-adversarial-review
description: Run a skeptical, adversarial Codex review that tries to break confidence in a change when the user wants a challenge review, risk hunting, or "对抗审查". Optional focus text narrows the attack.
---

# Codex Adversarial Review

A steerable, skeptical review: Codex is prompted to find the strongest
reasons the change should NOT ship.

## Steps

1. Collect any focus text from the user's request (e.g. "focus on auth").
2. Same size estimate and wait/background question as codex-review.
3. Run:

```bash
{{COMPANION}} adversarial-review --wait [focus text]
```

   Optional flags as with review: `--base <ref>`, `--scope ...`.

## Rules

- Return the output VERBATIM. Its job is doubt, not validation — do not
  soften findings.
- Do not fix issues unless the user asks.
