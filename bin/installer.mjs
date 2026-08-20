#!/usr/bin/env node
/**
 * codex-plugin-dsh installer — copies skill dirs into $DSH_HOME/skills.
 *
 * Usage:
 *   codex-plugin-dsh            install (idempotent)
 *   codex-plugin-dsh --uninstall
 *   codex-plugin-dsh --prefix <dir>   explicit skills dir (default: $DSH_HOME/skills or ~/.dsh/skills)
 *   codex-plugin-dsh --lib-install    also place lib/ under the prefix's .codex-companion/
 *                                     so skills can invoke the companion without a global npm install
 *
 * Copyright 2026 imBlanker (Apache-2.0).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_SRC = path.join(PKG_ROOT, "skills");
const MANAGED_PREFIX = "codex-";
const MANIFEST_NAME = ".codex-plugin-dsh.json";

function parseArgs(argv) {
  const options = { uninstall: false, prefix: null, libInstall: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--uninstall") options.uninstall = true;
    else if (arg === "--prefix") {
      const next = argv[i + 1];
      if (!next) throw new Error("--prefix requires a directory");
      options.prefix = next;
      i += 1;
    } else if (arg === "--lib-install") options.libInstall = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

function skillsRoot(options) {
  if (options.prefix) return path.resolve(options.prefix);
  const home = process.env.DSH_HOME || path.join(process.env.HOME || "", ".dsh");
  return path.join(home, "skills");
}

function managedSkillDirs() {
  return fs
    .readdirSync(SKILLS_SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(MANAGED_PREFIX))
    .map((e) => e.name);
}

function readManifest(dir) {
  const file = path.join(dir, MANIFEST_NAME);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function writeManifest(dir, files) {
  fs.writeFileSync(path.join(dir, MANIFEST_NAME), `${JSON.stringify({ version: 1, files }, null, 2)}\n`);
}

function copyTree(src, dst, transform) {
  fs.mkdirSync(dst, { recursive: true });
  const written = [];
  for (const entry of fs.readdirSync(src, { withFileTypes: true, recursive: false })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      written.push(...copyTree(s, d, transform));
    } else if (transform && entry.name.endsWith(".md")) {
      fs.writeFileSync(d, transform(fs.readFileSync(s, "utf8")));
      written.push(d);
    } else {
      fs.copyFileSync(s, d);
      written.push(d);
    }
  }
  return written;
}

function removeTree(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function companionInvokePath(options, root) {
  if (options.libInstall) {
    return `node "${path.join(root, ".codex-companion", "codex-companion.mjs")}"`;
  }
  return `node "${path.join(PKG_ROOT, "lib", "codex-companion.mjs")}"`;
}

function install(options) {
  const root = skillsRoot(options);
  fs.mkdirSync(root, { recursive: true });
  const names = managedSkillDirs();
  if (names.length === 0) throw new Error(`No managed skill dirs found in ${SKILLS_SRC}`);
  const invoke = companionInvokePath(options, root);
  const transform = (text) => text.replaceAll("{{COMPANION}}", invoke);
  let installed = 0;
  for (const name of names) {
    const src = path.join(SKILLS_SRC, name);
    const dst = path.join(root, name);
    if (fs.existsSync(dst)) removeTree(dst); // idempotent overwrite
    const files = copyTree(src, dst, transform);
    writeManifest(dst, files);
    installed += 1;
    console.log(`installed ${dst}`);
  }
  if (options.libInstall) {
    const libDir = path.join(root, ".codex-companion");
    removeTree(libDir);
    const files = copyTree(path.join(PKG_ROOT, "lib"), libDir);
    writeManifest(libDir, files);
    console.log(`installed companion lib (${files.length} files) at ${libDir}`);
  }
  console.log(`done: ${installed} skill(s) under ${root}`);
}

function uninstall(options) {
  const root = skillsRoot(options);
  let removed = 0;
  for (const name of managedSkillDirs()) {
    const dst = path.join(root, name);
    if (fs.existsSync(dst)) {
      removeTree(dst);
      removed += 1;
      console.log(`removed ${dst}`);
    }
  }
  const libDir = path.join(root, ".codex-companion");
  if (fs.existsSync(libDir)) {
    removeTree(libDir);
    console.log(`removed ${libDir}`);
  }
  console.log(`done: ${removed} skill(s) removed from ${root}`);
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }
  if (options.help) {
    console.log(
      [
        "Usage:",
        "  codex-plugin-dsh                  install skills into $DSH_HOME/skills (idempotent)",
        "  codex-plugin-dsh --uninstall      remove them again",
        "  codex-plugin-dsh --prefix <dir>   target a custom skills dir",
        "  codex-plugin-dsh --lib-install    also install the companion runtime next to the skills",
        "",
        "Environment: DSH_HOME (default ~/.dsh)"
      ].join("\n")
    );
    return;
  }
  try {
    if (options.uninstall) uninstall(options);
    else install(options);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
