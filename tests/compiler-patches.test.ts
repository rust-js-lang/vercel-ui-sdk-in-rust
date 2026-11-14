import {expect, test} from "bun:test";
import {mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";

async function fixture() {
  const root = mkdtempSync(join(tmpdir(), "ui-sdk-patch-test-"));
  const compiler = join(root, "rust-js");
  const patches = join(root, "patches", "rust-js");
  mkdirSync(compiler);
  mkdirSync(patches, {recursive: true});
  mkdirSync(join(root, "scripts"));
  await Bun.write(join(root, "scripts", "apply-compiler-patches.ts"), await Bun.file(resolve(import.meta.dir, "../scripts/apply-compiler-patches.ts")).text());
  const git = (args: string[]) => {
    const result = Bun.spawnSync(["git", "-C", compiler, "-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", ...args], {timeout: 5000});
    if (result.exitCode) throw new Error(result.stderr.toString());
    return result.stdout;
  };
  git(["init", "-q"]);
  const file = join(compiler, "value.txt");
  writeFileSync(file, "before\nvalue=A\nafter\n");
  git(["add", "value.txt"]);
  git(["-c", "user.name=Fixture", "-c", "user.email=fixture@example.com", "commit", "-qm", "chore(test): initial patch fixture", "-m", "Co-Authored-By: Codex <codex@openai.com>"]);
  writeFileSync(file, "before\nvalue=B\nafter\n");
  writeFileSync(join(patches, "first.patch"), git(["diff", "HEAD"]));
  git(["add", "value.txt"]);
  writeFileSync(file, "before\nvalue=C\nafter\n");
  writeFileSync(join(patches, "second.patch"), git(["diff"]));
  git(["reset", "--hard", "HEAD"]);
  writeFileSync(join(patches, "series.json"), JSON.stringify([{file: "first.patch"}, {file: "second.patch"}]));
  const apply = () => Bun.spawnSync([process.execPath, "scripts/apply-compiler-patches.ts"], {cwd: root, timeout: 10000});
  return {root, file, patches, git, apply};
}

test("overlapping compiler patches apply in order and remain idempotent", async () => {
  const f = await fixture();
  try {
    expect(f.apply().exitCode).toBe(0);
    expect(readFileSync(f.file, "utf8")).toBe("before\nvalue=C\nafter\n");
    expect(f.apply().exitCode).toBe(0);
    expect(readFileSync(f.file, "utf8")).toBe("before\nvalue=C\nafter\n");
    writeFileSync(join(f.patches, "series.json"), "[]");
    writeFileSync(f.file, "local compiler work\n");
    expect(f.apply().exitCode).toBe(0);
    expect(readFileSync(f.file, "utf8")).toBe("local compiler work\n");
  } finally {rmSync(f.root, {recursive: true, force: true});}
});

test("patch setup resumes a supported prefix and refuses to overwrite local edits", async () => {
  const f = await fixture();
  try {
    f.git(["apply", join(f.patches, "first.patch")]);
    expect(f.apply().exitCode).toBe(0);
    expect(readFileSync(f.file, "utf8")).toBe("before\nvalue=C\nafter\n");
    writeFileSync(f.file, "user edits\n");
    const refused = f.apply();
    expect(refused.exitCode).not.toBe(0);
    expect(refused.stderr.toString()).toContain("local changes were preserved");
    expect(readFileSync(f.file, "utf8")).toBe("user edits\n");
  } finally {rmSync(f.root, {recursive: true, force: true});}
});
