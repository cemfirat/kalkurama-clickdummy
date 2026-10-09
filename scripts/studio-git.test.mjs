import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";
import { Readable } from "node:stream";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = readFileSync(join(root, "vite.config.js"), "utf8");
const origin = "https://github.com/cemfirat/kalkurama-clickdummy.git";
const variable = "src/themes/kalkurama/variables.less";

// Evaluate the actual config functions. Only external module bindings and the
// default export are adapted; no Git/Studio function body is substituted.
// Vite/Less builds are NOT simulated as evidence of passing npm run verify.
function loadConfig(directory, execute, env) {
  const imports = source.match(/^import .*;$/gm);
  assert.equal(imports.length, 6, "Review test bindings if config imports change.");
  const code = source.replace(/^import .*;$/gm, "")
    .replace("export default defineConfig(", "const config = defineConfig(") + `
    globalThis.subject = { publishStudioChanges, startStudioVerification,
      studioGitStatus, themeStudioPlugin, assertStudioWorkflowPolicy,
      assertStudioGitState, assertGitHubOrigin, remoteBranchSha };
  `;
  const context = {
    execFileSync: execute, createHash, readFileSync, readdirSync, writeFileSync, resolve,
    process: { cwd: () => directory, env }, URL, console,
    less: { render() { throw new Error("Less build not available in this workflow test."); } },
    defineConfig: value => value
  };
  new Script(code, { filename: "vite.config.js" }).runInNewContext(context);
  return context.subject;
}

function fixture(t, options = {}) {
  const directory = mkdtempSync(join(tmpdir(), "kalkurama-studio-30-"));
  const work = join(directory, "work");
  const remote = join(directory, "remote.git");
  const home = join(directory, "home");
  mkdirSync(work); mkdirSync(home);
  // No user Git config, provider secrets, signers, hooks or credential helpers.
  const env = { PATH: process.env.PATH, HOME: home, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_TERMINAL_PROMPT: "0" };
  const git = (...args) => execFileSync("git", args, { cwd: work, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const write = (path, text) => { mkdirSync(join(work, path, ".."), { recursive: true }); writeFileSync(join(work, path), text); };
  const remoteGit = (...args) => execFileSync("git", ["--git-dir", remote, ...args], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  git("init", "--bare", "--initial-branch=main", remote);
  git("init", "--initial-branch=main");
  git("config", "user.name", "Studio Fixture"); git("config", "user.email", "studio@example.invalid");
  write("index.html", "<main>Fixture</main>\n");
  write(variable, "@color: red;\n"); write("src/themes/kalkurama.less", "// fixture\n");
  write("src/themes/customers/example.less", "// fixture\n");
  write("src/themes/kalkurama/images/logo.svg", "<svg/>\n");
  write("partials/header.html", "<header/>\n");
  write("partials/studio.html", "<aside>Not editable</aside>\n");
  write("README.md", "Fixture\n");
  for (const path of [".github/workflows/branch-verify.yml", ".github/workflows/pages-preview.yml"]) write(path, readFileSync(join(root, path)));
  git("add", "."); git("commit", "-m", "Fixture baseline");
  const main = git("rev-parse", "HEAD");
  git("remote", "add", "origin", origin);
  git("-c", "remote.origin.url=" + remote, "-c", "remote.origin.pushurl=" + remote, "push", "-u", "origin", "main");
  const calls = [];
  const execute = (command, supplied, suppliedOptions = {}) => {
    const args = [...supplied];
    calls.push({ command, args: [...args] });
    options.beforeCommand?.(command, args, { git, remoteGit, work, main });
    if (command === "npm") {
      assert.ok(args.length === 2 && args[0] === "run" && ["verify", "transfer:status"].includes(args[1]));
      if (options.failScript === args[1]) throw new Error("fixture verification failure: " + args[1]);
      options.duringVerification?.(args[1], { write, git, main, work, remoteGit });
      return "TEST DOUBLE: " + args[1] + "\n";
    }
    assert.equal(command, "git", "Only Git or the two fixed npm scripts may execute.");
    if (["fetch", "push", "ls-remote"].includes(args[0])) {
      if (options.failRemote?.(args)) throw new Error("fixture remote unavailable");
      // Only transport is redirected to a bare repo in this fixture. The real
      // origin/pushurl guards still inspect the configured GitHub URL above.
      const originIndex = args.indexOf("origin");
      assert.ok(originIndex > 0);
      args[originIndex] = remote;
      if (args[0] === "fetch") args[args.length - 1] = "main:refs/remotes/origin/main";
    }
    return execFileSync("git", args, { ...suppliedOptions, cwd: work, env, timeout: 5000 });
  };
  const subject = loadConfig(work, execute, env);
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return {
    subject, calls, git, remoteGit, write, main, work,
    edit() { write(variable, "@color: blue;\n"); },
    pushes() { return calls.filter(c => c.command === "git" && c.args[0] === "push"); },
    refs() { return remoteGit("for-each-ref", "--format=%(refname)").split("\n").filter(Boolean); },
    save() { this.edit(); return subject.publishStudioChanges("Update fixture theme"); }
  };
}

const noMutation = f => {
  assert.equal(f.git("rev-parse", "HEAD"), f.main);
  assert.equal(f.git("branch", "--show-current"), "main");
  assert.equal(f.git("diff", "--cached", "--name-only"), "");
  assert.deepEqual(f.refs(), ["refs/heads/main"]);
  assert.equal(f.pushes().length, 0);
};

test("prepare verifies before commit and pushes only the exact studio ref", t => {
  const f = fixture(t); const saved = f.save();
  assert.match(saved.branch, /^studio\/ui-/);
  assert.equal(saved.commitSha, f.git("rev-parse", "HEAD"));
  assert.equal(saved.remoteCi, "pending"); assert.equal(saved.verifyCreated, false);
  assert.deepEqual(f.refs().sort(), ["refs/heads/main", "refs/heads/" + saved.branch].sort());
  assert.equal(f.remoteGit("rev-parse", "refs/heads/" + saved.branch), saved.commitSha);
  assert.equal(f.remoteGit("rev-parse", "main"), f.main);
  assert.equal(f.pushes().length, 1);
  assert.deepEqual(f.pushes()[0].args, ["push", "--no-follow-tags", "-u", "origin", saved.commitSha + ":refs/heads/" + saved.branch]);
  const verification = f.calls.findIndex(c => c.command === "npm" && c.args[1] === "verify");
  const transfer = f.calls.findIndex(c => c.command === "npm" && c.args[1] === "transfer:status");
  const stage = f.calls.findIndex(c => c.command === "git" && c.args[0] === "add");
  assert.ok(verification >= 0 && transfer > verification && stage > transfer);
  assert.equal(f.git("status", "--porcelain"), "");
});

for (const script of ["verify", "transfer:status"]) {
  test(`failed ${script} stops before branch creation, staging, commit or push`, t => {
    const f = fixture(t, { failScript: script }); f.edit();
    assert.throws(() => f.subject.publishStudioChanges("Update fixture theme"), /Local verification failed/);
    noMutation(f); assert.match(readFileSync(join(f.work, variable), "utf8"), /blue/);
  });
}

for (const [name, change, expected] of [
  ["pre-staged edits", f => { f.edit(); f.git("add", variable); }, /staged changes/],
  ["non-Studio edits", f => f.write("README.md", "Changed\n"), /non-Studio change/],
  ["excluded Studio UI", f => f.write("partials/studio.html", "Changed\n"), /non-Studio change/],
  ["wrong origin", f => f.git("remote", "set-url", "origin", "https://example.invalid/other.git"), /requires origin/],
  ["wrong push origin", f => f.git("remote", "set-url", "--push", "origin", "https://example.invalid/other.git"), /requires origin/],
  ["multiple push origins", f => { f.git("remote", "set-url", "--add", "--push", "origin", origin); f.git("remote", "set-url", "--add", "--push", "origin", "https://example.invalid/other.git"); }, /requires origin/],
  ["mirror remote", f => f.git("config", "remote.origin.mirror", "true"), /mirror/],
  ["detached HEAD", f => f.git("checkout", "--detach"), /detached HEAD/],
  ["non-studio branch", f => f.git("switch", "-c", "feature/unrelated"), /main or an existing studio/]
]) {
  test(`prepare retains guard: ${name}`, t => {
    const f = fixture(t); f.edit(); change(f);
    assert.throws(() => f.subject.publishStudioChanges("Update fixture theme"), expected);
    assert.equal(f.pushes().length, 0);
    assert.equal(f.calls.filter(c => c.command === "npm").length, 0);
  });
}

test("prepare rejects stale local main and stale existing studio branches", t => {
  const f = fixture(t); f.git("switch", "-c", "fixture/remote-new");
  f.write("index.html", "new baseline"); f.git("add", "index.html"); f.git("commit", "-m", "Advance main fixture");
  const next = f.git("rev-parse", "HEAD");
  f.git("-c", "remote.origin.url=" + join(f.work, "..", "remote.git"), "-c", "remote.origin.pushurl=" + join(f.work, "..", "remote.git"), "push", "origin", next + ":refs/heads/main");
  f.git("switch", "main"); f.edit();
  assert.throws(() => f.subject.publishStudioChanges("Update fixture theme"), /not synchronized/);
  f.git("switch", "-c", "studio/old");
  assert.throws(() => f.subject.publishStudioChanges("Update fixture theme"), /current origin\/main/);
  assert.equal(f.pushes().length, 0);
});

test("prepare rejects a changed workflow policy before npm or push", t => {
  const f = fixture(t); f.git("switch", "-c", "studio/workflow-change");
  f.write(".github/workflows/unexpected.yml", "on: push\n");
  f.git("add", ".github/workflows/unexpected.yml"); f.git("commit", "-m", "Changed policy fixture"); f.edit();
  assert.throws(() => f.subject.publishStudioChanges("Update fixture theme"), /Workflow rules changed/);
  assert.equal(f.calls.filter(c => c.command === "npm").length, 0);
  assert.equal(f.pushes().length, 0);
});

test("prepare rejects already committed non-Studio changes", t => {
  const f = fixture(t); f.git("switch", "-c", "studio/unrelated");
  f.write("README.md", "unrelated"); f.git("add", "README.md"); f.git("commit", "-m", "Unrelated fixture");
  assert.throws(() => f.subject.publishStudioChanges("Update fixture theme"), /committed non-Studio/);
  assert.equal(f.pushes().length, 0);
});

test("verification-time edits cannot become an untested commit", t => {
  const f = fixture(t, { duringVerification(script, { write }) { if (script === "verify") write(variable, "@color: green;\n"); } });
  f.edit(); assert.throws(() => f.subject.publishStudioChanges("Update fixture theme"), /changed during verification/);
  noMutation(f);
});

test("a clean saved studio branch can be saved again without another commit or CI ref", t => {
  const f = fixture(t); const saved = f.save(); f.calls.length = 0;
  const again = f.subject.publishStudioChanges("Update fixture theme");
  assert.equal(again.commitSha, saved.commitSha); assert.equal(again.branch, saved.branch);
  assert.equal(f.calls.filter(c => c.command === "git" && c.args[0] === "commit").length, 0);
  assert.equal(f.refs().some(r => r.startsWith("refs/heads/verify/")), false);
});

test("prepare never follows annotated tags, even if push.followTags is enabled", t => {
  const f = fixture(t); f.git("tag", "-a", "fixture-tag", "-m", "Fixture"); f.git("config", "push.followTags", "true");
  f.save(); assert.equal(f.refs().some(r => r.startsWith("refs/tags/")), false);
});

test("separate verification creates an exact-SHA ref once, never a second run", t => {
  const f = fixture(t); const saved = f.save(); f.calls.length = 0;
  const verify = f.subject.startStudioVerification(saved.commitSha, true);
  assert.equal(verify.verifyCreated, true); assert.equal(verify.remoteCi, "requested");
  assert.equal(f.remoteGit("rev-parse", "refs/heads/" + verify.verifyBranch), saved.commitSha);
  assert.equal(f.pushes().length, 1);
  assert.ok(f.pushes()[0].args.includes("--force-with-lease=refs/heads/" + verify.verifyBranch + ":"));
  const again = f.subject.startStudioVerification(saved.commitSha, true);
  assert.equal(again.verifyCreated, false); assert.equal(again.remoteCi, "already-requested");
  assert.equal(f.pushes().length, 1); assert.equal(f.git("rev-parse", "HEAD"), saved.commitSha);
  assert.equal(f.remoteGit("rev-parse", "main"), f.main);
});

test("verification requires an explicit confirmation, a valid SHA and the exact clean HEAD", t => {
  const f = fixture(t); const saved = f.save(); f.calls.length = 0;
  for (const [sha, confirm] of [[saved.commitSha, false], [saved.commitSha, "true"], ["--all", true], [f.main, true]]) {
    assert.throws(() => f.subject.startStudioVerification(sha, confirm));
  }
  f.edit(); f.write(variable, "@color: green;\n");
  assert.throws(() => f.subject.startStudioVerification(saved.commitSha, true), /clean, saved/);
  assert.equal(f.pushes().length, 0);
});

test("verification refuses unsaved remote state", t => {
  const f = fixture(t); f.git("switch", "-c", "studio/local-only"); f.edit();
  f.git("add", variable); f.git("commit", "-m", "Local-only fixture");
  assert.throws(() => f.subject.startStudioVerification(f.git("rev-parse", "HEAD"), true), /Save this exact/);
  assert.equal(f.pushes().length, 0);
});

test("remote lookup failure is never mistaken for an absent verify ref", t => {
  const options = {};
  const f = fixture(t, options); const saved = f.save(); f.calls.length = 0;
  options.failRemote = args => args[0] === "ls-remote" && args.at(-1).includes("verify/");
  assert.throws(() => f.subject.startStudioVerification(saved.commitSha, true), /remote unavailable/);
  assert.equal(f.pushes().length, 0);
});

test("a conflicting verify ref is not updated", t => {
  const f = fixture(t); const saved = f.save(); f.calls.length = 0;
  const ref = "refs/heads/verify/studio-ui-" + saved.commitSha.slice(0, 12);
  f.remoteGit("update-ref", ref, f.main);
  assert.throws(() => f.subject.startStudioVerification(saved.commitSha, true), /different commit/);
  assert.equal(f.remoteGit("rev-parse", ref), f.main); assert.equal(f.pushes().length, 0);
});

test("create-only lease prevents a raced verify ref from being advanced", t => {
  const options = {};
  const f = fixture(t, options); const saved = f.save();
  const ref = "refs/heads/verify/studio-ui-" + saved.commitSha.slice(0, 12);
  options.beforeCommand = (cmd, args) => {
    if (cmd === "git" && args[0] === "push" && args.some(a => a.startsWith("--force-with-lease="))) {
      f.remoteGit("update-ref", ref, f.main);
    }
  };
  assert.throws(() => f.subject.startStudioVerification(saved.commitSha, true));
  assert.equal(f.remoteGit("rev-parse", ref), f.main);
});

test("push failure preserves the local commit without creating a verify ref", t => {
  const f = fixture(t, { failRemote: args => args[0] === "push" }); f.edit();
  assert.throws(() => f.subject.publishStudioChanges("Update fixture theme"), /remote unavailable/);
  assert.notEqual(f.git("rev-parse", "HEAD"), f.main);
  assert.equal(f.git("status", "--porcelain"), "");
  assert.deepEqual(f.refs(), ["refs/heads/main"]);
});

test("no changes and invalid identity/message are refused before mutation", t => {
  const f = fixture(t);
  assert.throws(() => f.subject.publishStudioChanges("Update fixture theme"), /no Kalkurama Studio changes/);
  f.edit();
  for (const value of ["", "x", "x".repeat(121), "First\nSecond"]) assert.throws(() => f.subject.publishStudioChanges(value), /Commit message/);
  f.git("config", "--unset", "user.email");
  assert.throws(() => f.subject.publishStudioChanges("Update fixture theme"), /user.name and user.email/);
  noMutation(f);
});

async function endpoint(f, path, body, remoteAddress = "127.0.0.1") {
  let middleware;
  f.subject.themeStudioPlugin("kalkurama").configureServer({ middlewares: { use(fn) { middleware = fn; } } });
  const req = Readable.from([Buffer.from(JSON.stringify(body))]);
  req.method = "POST"; req.url = path; req.socket = { remoteAddress };
  return new Promise((resolveDone, reject) => {
    const res = { statusCode: 200, setHeader() {}, end(text) { resolveDone({ status: this.statusCode, body: JSON.parse(text) }); } };
    middleware(req, res, () => reject(new Error("Unexpected fallthrough")));
  });
}

test("legacy publish endpoint now prepares only; explicit remote endpoint is separate", async t => {
  const f = fixture(t); f.edit();
  const saved = await endpoint(f, "/__studio/git/publish", { message: "Update fixture theme", startCI: true });
  assert.equal(saved.status, 200); assert.equal(saved.body.remoteCi, "pending");
  assert.equal(f.refs().some(r => r.includes("verify/")), false);
  const denied = await endpoint(f, "/__studio/git/remote-verify", { commitSha: saved.body.commitSha });
  assert.equal(denied.status, 500); assert.equal(f.refs().some(r => r.includes("verify/")), false);
  const sent = await endpoint(f, "/__studio/git/remote-verify", { commitSha: saved.body.commitSha, confirmRemoteVerification: true });
  assert.equal(sent.status, 200); assert.equal(sent.body.verifyCreated, true);
});

test("both write endpoints reject non-loopback clients before any Git call", async t => {
  const f = fixture(t);
  for (const path of ["/__studio/git/publish", "/__studio/git/remote-verify"]) {
    const response = await endpoint(f, path, {}, "203.0.113.9");
    assert.equal(response.status, 403);
  }
  assert.equal(f.calls.length, 0);
});

test("additional allowed edits advance only the existing saved studio branch", t => {
  const f = fixture(t); const first = f.save(); f.calls.length = 0;
  f.write(variable, "@color: green;\n");
  f.write("src/themes/kalkurama/images/icons/add.svg", "<svg/>\n");
  const next = f.subject.publishStudioChanges("Update theme and asset");
  assert.equal(next.branch, first.branch); assert.notEqual(next.commitSha, first.commitSha);
  assert.equal(f.git("rev-parse", "HEAD^"), first.commitSha);
  assert.equal(f.pushes().length, 1); assert.equal(f.refs().some(r => r.includes("verify/")), false);
  assert.equal(f.remoteGit("rev-parse", "main"), f.main);
});

test("main advancing during the build stops before a local commit or push", t => {
  const f = fixture(t, {
    duringVerification(script, { git, work }) {
      if (script !== "verify") return;
      const remote = join(work, "..", "remote.git");
      const next = git("commit-tree", git("rev-parse", "HEAD^{tree}"), "-p", git("rev-parse", "HEAD"), "-m", "Concurrent main advancement");
      git("push", remote, next + ":refs/heads/main");
    }
  });
  f.edit(); assert.throws(() => f.subject.publishStudioChanges("Update fixture theme"), /not synchronized/);
  assert.equal(f.git("rev-parse", "HEAD"), f.main);
  assert.equal(f.git("branch", "--show-current"), "main");
  assert.equal(f.git("diff", "--cached", "--name-only"), "");
  assert.equal(f.pushes().length, 0);
});

test("remote verification fails closed when either local verification command fails", t => {
  const options = {}; const f = fixture(t, options); const saved = f.save(); f.calls.length = 0;
  for (const script of ["verify", "transfer:status"]) {
    options.failScript = script;
    assert.throws(() => f.subject.startStudioVerification(saved.commitSha, true), /Local verification failed/);
    assert.equal(f.pushes().length, 0);
  }
  assert.equal(f.refs().some(r => r.includes("verify/")), false);
});
