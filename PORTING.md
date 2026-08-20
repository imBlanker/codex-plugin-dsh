# PORTING.md — upstream sync & host seams

This repo is a port of [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc)
(Claude Code plugin) to DeepSeek Harness (dsh). The host-agnostic core is
**vendored** from upstream and kept as close to verbatim as possible; all
host-specific behavior is funneled through `lib/host-seams.mjs`.

The seam design is identical to codex-plugin-pi's, so the upstream-sync
procedure is uniform across both ports.

## Vendored files

Source: `<cc-mirror>/plugins/codex/scripts/` → this repo's `lib/`:

| Upstream | Here | Notes |
|---|---|---|
| `codex-companion.mjs` | `lib/codex-companion.mjs` | ROOT_DIR + worker path via seam |
| `app-server-broker.mjs` | `lib/app-server-broker.mjs` | unchanged |
| `lib/app-server.mjs` | `lib/app-server.mjs` | client info via seam |
| `lib/broker-*.mjs`, `lib/codex.mjs`, `lib/git.mjs`, `lib/job-control.mjs`, `lib/tracked-jobs.mjs`, `lib/state.mjs`, `lib/render.mjs`, `lib/args.mjs`, `lib/fs.mjs`, `lib/process.mjs`, `lib/prompts.mjs`, `lib/workspace.mjs` | same names under `lib/` | state root + session env via seam |
| `../schemas/review-output.schema.json` | `schemas/review-output.schema.json` | unchanged |
| `../prompts/adversarial-review.md` | `prompts/adversarial-review.md` | unchanged |

Upstream commit at last sync: `db52e28` (v1.0.6, 2026-07-08).

Not vendored (Claude-Code-specific): `commands/*.md`, `agents/`, `hooks/*`,
CC skills, CC marketplace manifests, `claude-session-transfer.mjs`'s CC-only
path guard (replaced by seam `allowedTranscriptRoots()`). The dsh host
surface is `skills/` (8 Agent-Skills dirs) + `bin/installer.mjs`.

## Host seams (`lib/host-seams.mjs`)

- `hostClientInfo()` — `{ title: "Codex Plugin", name: "DeepSeek Harness", version }`
- `dshHomeDir()` — `$DSH_HOME` → `~/.dsh`
- `stateRootDir()` — `$DSH_CODEX_STATE_DIR` → `$DSH_HOME/storages/codex-companion`
- `pluginRoot()` / `companionScriptPath()` — resolved from `import.meta.url`
- `allowedTranscriptRoots()` — `$DSH_HOME/sessions` + Claude projects + Pi sessions
- `SESSION_ID_ENV` = `CODEX_COMPANION_SESSION_ID` (skills instruct the agent to export it per conversation)

Vendored files are patched **only** to import from `host-seams.mjs`.
`grep -r "CLAUDE_" lib/ skills/ bin/` must return nothing (doc mentions
excluded).

## Upstream sync procedure

1. `git -C <cc-mirror> fetch && git log` — review new commits.
2. Diff each vendored file against `lib/`.
3. Port changes; keep seam imports intact.
4. Record the new upstream commit hash at the top of this file.
5. `npm test` must stay green.
6. One PR per upstream drop.

## Skills conventions

- Skill dirs are `codex-*` (installer-managed prefix); each `SKILL.md`
  contains a `{{COMPANION}}` placeholder the installer replaces with the
  absolute companion invocation (`node "<path>/lib/codex-companion.mjs"`,
  or the `--lib-install` copy when requested).
- The installer writes a `.codex-plugin-dsh.json` manifest per skill dir
  (file list) and removes only `codex-*` dirs + `.codex-companion` on
  uninstall — user files survive.
