import {mkdir} from "node:fs/promises";
import {resolve} from "node:path";

const root = resolve(import.meta.dir, "..");
const sourcePath = "crates/core/src/foundation/date/plain_date.rs";
const source = await Bun.file(resolve(root, sourcePath)).text();
const directory = resolve(root, "test-results/calendar-probe");
await mkdir(resolve(directory, "src"), {recursive: true});

// This is a freshly derived test input, never a second editable implementation.
await Bun.write(resolve(directory, "src/lib.rs"), source);
await Bun.write(resolve(directory, "Cargo.toml"), [
  "[package]", 'name = "ui-sdk-calendar-probe"', 'version = "0.0.0"', 'edition = "2024"',
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

const build = Bun.spawn([
  "bun", resolve(root, "rust-js/tooling/cli.js"), "build", "--package", "ui-sdk-calendar-probe",
], {
  cwd: directory, env: {...process.env, CARGO_TARGET_DIR: resolve(root, "target")},
  stdin: "inherit", stdout: "inherit", stderr: "inherit", timeout: 45000,
});
const code = await build.exited;
if (code !== 0) process.exit(code);
if (await Bun.file(resolve(root, sourcePath)).text() !== source) throw new Error("Calendar source changed during build; rerun probe");
console.log("Calendar probe built from " + sourcePath);
