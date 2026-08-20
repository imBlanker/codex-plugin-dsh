import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INSTALLER = path.join(ROOT, "bin", "installer.mjs");

function makeTmpHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dsh-installer-test-"));
}

function runInstaller(args, env) {
  return spawnSync(process.execPath, [INSTALLER, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env }
  });
}

test("install copies skills with substituted companion path and is idempotent", () => {
  const home = makeTmpHome();
  const skillsDir = path.join(home, ".dsh", "skills");
  const env = { HOME: home, DSH_HOME: path.join(home, ".dsh") };

  const first = runInstaller([], env);
  assert.equal(first.status, 0, first.stderr);

  const names = fs.readdirSync(skillsDir).filter((n) => n.startsWith("codex-"));
  assert.equal(names.length, 9);
  for (const name of names) {
    const md = fs.readFileSync(path.join(skillsDir, name, "SKILL.md"), "utf8");
    assert.match(md, new RegExp(`node ".*codex-companion\\.mjs"`), `${name} companion path substituted`);
    assert.ok(!md.includes("{{COMPANION}}"), `${name} no placeholder left`);
    assert.ok(fs.existsSync(path.join(skillsDir, name, ".codex-plugin-dsh.json")), `${name} manifest written`);
  }

  const before = fs.statSync(path.join(skillsDir, "codex-review", "SKILL.md")).mtimeMs;
  const second = runInstaller([], env);
  assert.equal(second.status, 0, second.stderr);
  const after = fs.statSync(path.join(skillsDir, "codex-review", "SKILL.md")).mtimeMs;
  assert.ok(after >= before, "idempotent reinstall works");

  // uninstall removes managed dirs only
  const un = runInstaller(["--uninstall"], env);
  assert.equal(un.status, 0, un.stderr);
  for (const name of names) {
    assert.ok(!fs.existsSync(path.join(skillsDir, name)), `${name} removed`);
  }
  // sentinel survives
  fs.mkdirSync(skillsDir, { recursive: true });
  fs.writeFileSync(path.join(skillsDir, "user-own-skill"), "keep me");
  runInstaller([], env);
  runInstaller(["--uninstall"], env);
  assert.ok(fs.existsSync(path.join(skillsDir, "user-own-skill")), "user files untouched");
});

test("--lib-install also drops the companion runtime", () => {
  const home = makeTmpHome();
  const env = { HOME: home, DSH_HOME: path.join(home, ".dsh") };
  const r = runInstaller(["--lib-install"], env);
  assert.equal(r.status, 0, r.stderr);
  const libDir = path.join(home, ".dsh", "skills", ".codex-companion");
  assert.ok(fs.existsSync(path.join(libDir, "codex-companion.mjs")));
  const md = fs.readFileSync(path.join(home, ".dsh", "skills", "codex-review", "SKILL.md"), "utf8");
  assert.match(md, new RegExp(`node "${libDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/codex-companion\\.mjs"`));
  runInstaller(["--uninstall"], env);
  assert.ok(!fs.existsSync(libDir), "lib removed on uninstall");
});

test("--prefix overrides the target dir", () => {
  const home = makeTmpHome();
  const prefix = path.join(home, "custom-skills");
  const r = runInstaller(["--prefix", prefix], { HOME: home });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(path.join(prefix, "codex-review", "SKILL.md")));
});
