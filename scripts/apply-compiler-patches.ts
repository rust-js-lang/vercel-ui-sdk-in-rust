import {mkdtempSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {resolve, join} from "node:path";

const root = resolve(import.meta.dir, "..");
const directory = resolve(root, "rust-js");
const patches = resolve(root, "patches/rust-js");
const series: {file: string}[] = await Bun.file(resolve(patches, "series.json")).json();
const scratch = mkdtempSync(join(tmpdir(), "ui-sdk-patch-index-"));
const env = {...process.env, GIT_INDEX_FILE: join(scratch, "index")};
function git(args: string[], indexed = false, allowed = [0]) {
  const result = Bun.spawnSync(["git", "-C", directory, ...args], {
    timeout: 10000,
    env: indexed ? env : process.env,
  });
  if (!allowed.includes(result.exitCode)) throw new Error(result.stderr.toString());
  return result;
}
try {
  // Construct the entire series in an independent index. Later patches can
  // change earlier context, so reverse-checking each patch cannot prove that
  // the final series is already applied.
  git(["read-tree", "HEAD"], true);
  const states = [git(["write-tree"], true).stdout.toString().trim()];
  const paths = new Set<string>();
  for (const entry of series) {
    const patch = resolve(patches, entry.file);
    for (const row of git(["apply", "--numstat", "-z", patch]).stdout.toString().split("\0")) {
      if (row) paths.add(row.split("\t").slice(2).join("\t"));
    }
    git(["apply", "--cached", patch], true);
    states.push(git(["write-tree"], true).stdout.toString().trim());
  }
  const names = [...paths];
  let applied = -1;
  for (let prefix = states.length - 1; prefix >= 0 && applied < 0; prefix--) {
    git(["read-tree", states[prefix]], true);
    let matches = true;
    for (const path of names) {
      const tracked = git(["ls-files", "--", path], true).stdout.length > 0;
      if (!tracked && await Bun.file(resolve(directory, path)).exists()) matches = false;
    }
    if (matches && (names.length === 0 || git(["diff", "--quiet", "--", ...names], true, [0, 1]).exitCode === 0)) applied = prefix;
  }
  if (applied < 0) throw new Error("Compiler files do not match a supported patch-series state; local changes were preserved.");
  for (const entry of series.slice(applied)) {
    git(["apply", resolve(patches, entry.file)]);
    console.log("Applied " + entry.file);
  }
} finally {
  rmSync(scratch, {recursive: true, force: true});
}
