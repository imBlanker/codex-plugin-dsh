---
name: codex-setup
description: Check whether the Codex CLI is ready (binary + auth) when the user asks to set up Codex or a codex command reports it missing. Can offer a one-command npm install.
---

# Codex Setup

## Steps

1. Run the readiness check:

```bash
{{COMPANION}} setup --json
```

2. Parse the JSON and report each line: node / npm / codex / auth / ready.
3. If `codex.available` is false AND `npm.available` is true:
   ask the user once whether to install Codex now. If yes:

```bash
npm install -g @openai/codex
```

   then re-run the setup check and report again.
4. If `auth.loggedIn` is false, tell the user to run `codex login`
   (ChatGPT account or API key both work) and then re-check.

## Rules

- Never install without asking.
- Report facts only; no speculation about auth state.
