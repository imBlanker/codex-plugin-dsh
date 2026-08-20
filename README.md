# codex-plugin-dsh

Use [Codex](https://developers.openai.com/codex/) from inside
[DeepSeek Harness](https://www.npmjs.com/package/@deepseek-ai/dsh) (dsh)
for code reviews or to delegate tasks.

This plugin is for dsh users who want an easy way to start using Codex from
the workflow they already have. It is a port of OpenAI's official
[codex-plugin-cc](https://github.com/openai/codex-plugin-cc) (Claude Code)
to dsh's skill system.

> Status: v0.1.x — skills-first port. A native cordis plugin (agent tools,
> web dashboard) is planned post-1.0. See CHANGELOG.md.

## What You Get

Eight skills the dsh agent can use (ask in natural language, or name the
skill):

- **codex-review** — read-only Codex review of your git state
- **codex-adversarial-review** — skeptical, steerable challenge review
- **codex-rescue** — delegate stuck or heavy work to Codex (background job)
- **codex-transfer** — hand the current session context to Codex
  (experimental)
- **codex-status / codex-result / codex-cancel** — background job management
- **codex-setup** — Codex CLI readiness check, with an optional one-command
  npm install

## Install

Requires Node.js ≥ 18.18, a working `dsh` install, and the `codex` CLI
(`npm install -g @openai/codex` + `codex login`).

```bash
npm install -g codex-plugin-dsh
codex-plugin-dsh            # copies the skills into $DSH_HOME/skills
```

Then restart dsh (or start a new conversation) and ask the agent, e.g.
"run a codex review".

Options:

```bash
codex-plugin-dsh --uninstall    # remove the skills again
codex-plugin-dsh --prefix DIR   # custom skills dir (default $DSH_HOME/skills)
codex-plugin-dsh --lib-install  # also vendor the companion runtime under the
                                # skills dir (no global npm package needed at
                                # runtime; still needs the codex CLI)
```

Manual alternative (no npm publish needed): clone this repo and run
`node bin/installer.mjs`.

## Usage examples

- "用 codex 审查一下当前的改动" → codex-review
- "let codex adversarially review this, focus on auth" → codex-adversarial-review
- "把这个卡住的任务交给 codex 处理：<任务描述>" → codex-rescue
- "codex 任务状态怎么样了" → codex-status / codex-result
- "帮我设置 codex" → codex-setup

## How it works

The skills instruct the dsh agent to run the bundled companion CLI
(`lib/codex-companion.mjs`, ported from codex-plugin-cc), which talks to
the Codex app-server with your existing Codex configuration. Jobs are
tracked per workspace under `$DSH_HOME/storages/codex-companion/`.

DSH has no slash-command surface; the gate-style proactive behaviors of
the Claude Code plugin (stop review gate) are not host-enforced here —
everything is agent-cooperative via the skills.

## License & Attribution

Apache-2.0. Derived from openai/codex-plugin-cc © 2026 OpenAI; see NOTICE.
New code © 2026 imBlanker.
