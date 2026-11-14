import {resolve} from "node:path";
const root = resolve(import.meta.dir, "..");
const directory = resolve(root, "rust-js");
const patch = resolve(root, "patches/rust-js/1827-ordering-predicates.patch");
function git(args: string[]) {
  return Bun.spawnSync(["git", "-C", directory, ...args], {timeout: 10000});
}
const check = git(["apply", "--check", patch]);
if (check.exitCode === 0) {
  const apply = git(["apply", patch]);
  if (apply.exitCode !== 0) throw new Error(apply.stderr.toString());
  console.log("Applied rust-js #1827 Ordering predicates patch");
} else if (git(["apply", "--reverse", "--check", patch]).exitCode !== 0) {
  throw new Error("Compiler patch #1827 does not match this submodule revision: " + check.stderr.toString());
}
