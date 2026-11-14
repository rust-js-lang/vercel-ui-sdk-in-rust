import {mkdir} from "node:fs/promises";
import {resolve, relative, sep} from "node:path";

const root = resolve(import.meta.dir, "..");
const sourcePath = Bun.argv[2];
if (!sourcePath) throw new Error("Usage: bun scripts/build-core-probe.ts crates/core/src/path.rs");
const sourceRoot = resolve(root, "crates/core/src");
const sourceRelative = relative(sourceRoot, resolve(root, sourcePath));
if (sourceRelative.startsWith("..") || !sourceRelative.endsWith(".rs")) throw new Error("Probe source must be a canonical core Rust file");
const name = sourceRelative.slice(0, -3).split(sep).join("-").replaceAll("_", "-");
const source = await Bun.file(resolve(root, sourcePath)).text();
const directory = resolve(root, "test-results/core-probes", sourceRelative.slice(0, -3));
await mkdir(resolve(directory, "src"), {recursive: true});

// This is a freshly derived test input, never a second editable implementation.
await Bun.write(resolve(directory, "src/lib.rs"), source);
await Bun.write(resolve(directory, "Cargo.toml"), [
  "[package]", 'name = "ui-sdk-' + name + '-probe"', 'version = "0.0.0"', 'edition = "2024"',
  "", "[workspace]", "", "[dependencies]",
  "js = { package = \"rust-js-builtins\", path = " + JSON.stringify(resolve(root, "rust-js/builtins")) + " }",
  "", "[lints.rust]", "unexpected_cfgs = { level = \"warn\", check-cfg = [\"cfg(rust_js)\"] }",
  "", "[package.metadata.rust-js.test]", 'runner = "bun"', "",
].join("\n"));
const revision = Bun.spawnSync(["git", "-C", resolve(root, "rust-js"), "rev-parse", "HEAD"], {timeout: 10000});
if (revision.exitCode !== 0) throw new Error(revision.stderr.toString());
await Bun.write(resolve(directory, "provenance.json"), JSON.stringify({
  source: sourcePath,
  sha256: new Bun.CryptoHasher("sha256").update(source).digest("hex"),
  compiler: revision.stdout.toString().trim(),
  toolchain: await Bun.file(resolve(root, "rust-toolchain.toml")).text(),
}, null, 2) + "\n");

// Includes a cold compiler rebuild (measured 43.3 s) plus the Cargo probe.
// A 45 s combined deadline expired after that rebuild; warm probes take <2 s.
const build = Bun.spawn([
  "bun", resolve(root, "rust-js/tooling/cli.js"), "build", "--package", "ui-sdk-" + name + "-probe",
], {
  cwd: directory, env: {...process.env, CARGO_TARGET_DIR: resolve(root, "target")},
  stdin: "inherit", stdout: "inherit", stderr: "inherit", timeout: 90000,
});
const code = await build.exited;
if (code !== 0) process.exit(code);
if (await Bun.file(resolve(root, sourcePath)).text() !== source) throw new Error("Core source changed during build; rerun probe");
console.log("Core probe built from " + sourcePath);
