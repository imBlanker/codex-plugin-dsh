---
name: codex-transfer
description: Hand the current session's context to Codex as a resumable thread when the user wants to continue this work inside Codex ("transfer to codex", "移交给 codex"). Experimental — DSH session files may not parse.
---

# Codex Transfer (experimental)

Convert the current session transcript into a Codex thread the user can
continue with `codex resume`.

## Steps

1. Locate the current session file under `$DSH_HOME/sessions/` (newest
   .jsonl for this conversation).
2. Run:

```bash
{{COMPANION}} transfer --source <session.jsonl>
```

3. Report the result verbatim (it includes the `codex resume <id>` line).

## Rules

- EXPERIMENTAL: Codex imports Claude-format transcripts; a DSH session
  may fail to parse. On failure, offer degraded mode instead: paste a
  context summary into a new codex-rescue task.
