import {resolve} from "node:path";
const root = resolve(import.meta.dir, "..");
const directory = resolve(root, "rust-js");
const patches = resolve(root, "patches/rust-js");
const series: {file: string}[] = await Bun.file(resolve(patches, "series.json")).json();
function git(args: string[]) {
  return Bun.spawnSync(["git", "-C", directory, ...args], {timeout: 10000});
}
for (const entry of series) {
  const patch = resolve(patches, entry.file);
  const check = git(["apply", "--check", patch]);
  if (check.exitCode === 0) {
    const apply = git(["apply", patch]);
    if (apply.exitCode !== 0) throw new Error(apply.stderr.toString());
    console.log("Applied " + entry.file);
  } else if (git(["apply", "--reverse", "--check", patch]).exitCode !== 0) {
    throw new Error(entry.file + " does not match this compiler revision: " + check.stderr.toString());
  }
}
