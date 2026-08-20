---
name: codex-status
description: List Codex companion background jobs and their states when the user asks what Codex is doing, job progress, or "codex 状态".
---

# Codex Job Status

```bash
{{COMPANION}} status [--all] [job-id]
```

- Default shows this session's jobs; `--all` shows every session's.
- Return the output verbatim.
- If the user wants a job's output, use codex-result; to stop one, codex-cancel.
