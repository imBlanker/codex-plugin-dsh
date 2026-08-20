---
name: codex-result
description: Fetch and show the result of a Codex background job when the user asks for a job's output or "codex 结果".
---

# Codex Job Result

```bash
{{COMPANION}} result [job-id]
```

- Without a job id, resolves the latest job of this session.
- Return the result VERBATIM in a fenced block — do not summarize or act
  on it unless asked.
- If the job is still running, the output says so; suggest codex-status.
