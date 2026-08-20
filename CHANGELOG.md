# Changelog

## 0.2.0 (2026-08-20) — full-lifecycle review gate (family lockstep)

- Gate family core vendored to `lib/gate/` (byte-identical with
  codex-plugin-cc fork & codex-plugin-pi): verdict contract, budget tiers
  15m/10m/1m/30s, AA-seeded effort picker, OS-global learner, fail-open
  timeouts.
- Companion: `gate plan|follow|completion|learner|status|on|off`.
- New 9th skill `codex-gate`: three-stage protocol (plan gate → realtime
  follow with halt-chain on FAIL → completion gate before done/commit);
  `{{COMPANION}}` substitution by installer.
- `runAppServerTurn({disableBroker})` — no lazy-broker leaks.
- Tests: 94 (76 + 18 gate). Learner store shared cross-host.

## 0.1.0 (2026-08-19)

Initial port of [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc)
(v1.0.6, commit db52e28) to DeepSeek Harness (dsh), skills-first.

- Vendored companion core (`lib/`) with host seams: DSH client identity,
  `$DSH_HOME/storages/codex-companion` state root (`DSH_CODEX_STATE_DIR`
  override), DSH session transcript roots for transfer.
- 8 skills (`codex-review`, `codex-adversarial-review`, `codex-rescue`,
  `codex-transfer` (experimental), `codex-status`, `codex-result`,
  `codex-cancel`, `codex-setup`) driving the companion from the DSH agent.
- Installer `codex-plugin-dsh` / `bin/installer.mjs`: idempotent install of
  skills into `$DSH_HOME/skills` with absolute companion-path substitution,
  `--uninstall`, `--prefix`, `--lib-install` (self-contained runtime).
- Ported test suite (76 passing; CC-hook tests skipped by design) +
  installer tests (idempotency, sentinel survival, prefix/lib modes).
- PR CI, bump-version script, Apache-2.0 + attribution (NOTICE, PORTING.md).
