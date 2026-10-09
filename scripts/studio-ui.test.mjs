import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";

const source = readFileSync(new URL("../src/studio.js", import.meta.url), "utf8");
const partial = readFileSync(new URL("../partials/studio.html", import.meta.url), "utf8");
const sha = "a".repeat(40);
const path = "src/themes/kalkurama/variables.less";

class Element {
  constructor() {
    this.value = ""; this.textContent = ""; this.className = ""; this.disabled = false;
    this.options = []; this.events = {}; this.classes = new Set(); this.dataset = {};
    this.classList = { toggle: (name, force) => force ? this.classes.add(name) : this.classes.delete(name) };
  }
  setAttribute(name, value) { this[name] = value; }
  replaceChildren(...options) { this.options = options; }
  addEventListener(name, callback) { (this.events[name] ??= []).push(callback); }
  async trigger(name, event = {}) { for (const callback of this.events[name] ?? []) await callback(event); }
}

// Test the real client event handlers against explicit DOM/API/UIkit doubles.
// This verifies behavior, not Vite bundling or real browser layout.
async function client({ cleanStudio = true, confirmed = true, fail = null, pausePublish = null, existingVerify = false } = {}) {
  const elements = new Map();
  const get = selector => {
    if (!elements.has(selector)) elements.set(selector, new Element());
    return elements.get(selector);
  };
  const calls = [], confirmations = [], notifications = [];
  const file = { path, type: "theme", content: "@color: blue;", headContent: "@color: red;", modified: !cleanStudio };
  let saved = cleanStudio;
  const status = () => ({
    ok: true, files: [path], mode: "kalkurama", branch: saved ? "studio/ui-fixture" : "main", head: sha.slice(0, 7),
    git: { branch: saved ? "studio/ui-fixture" : "main", head: sha.slice(0, 7), commitSha: sha,
      mainSynchronized: true, syncError: "", changes: saved ? [] : [{ path }] }
  });
  const fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (fail && url.endsWith(fail)) return { ok: false, json: async () => ({ ok: false, error: "Fixture backend failure" }) };
    let payload;
    if (url === "/__studio/status") payload = status();
    else if (url.startsWith("/__studio/file?")) payload = { ok: true, file: { ...file } };
    else if (url === "/__studio/file") {
      file.content = JSON.parse(options.body).content; file.modified = true; saved = false;
      payload = { ok: true, type: "theme", file: { ...file }, compiled: [path] };
    } else if (url === "/__studio/git/publish") {
      if (pausePublish) await pausePublish;
      saved = true; file.modified = false;
      payload = { ok: true, branch: "studio/ui-fixture", commitSha: sha, verification: { ok: true, output: "fixture local report" }, remoteCi: "pending", verifyCreated: false };
    } else if (url === "/__studio/git/verify") payload = { ok: true, verification: { ok: true, output: "fixture local report" }, git: status().git };
    else if (url === "/__studio/git/remote-verify") payload = {
      ok: true, branch: "studio/ui-fixture", commitSha: sha, verifyBranch: "verify/studio-ui-" + sha.slice(0, 12),
      verifyCreated: !existingVerify, verification: { ok: true, output: "fixture local report" }
    };
    else throw new Error("Unexpected client endpoint: " + url);
    return { ok: true, json: async () => payload };
  };
  const context = {
    document: { querySelector: get, querySelectorAll: () => [], createElement: () => new Element() },
    window: { location: { search: "" }, addEventListener() {}, confirm(message) { confirmations.push(message); return confirmed; } },
    URLSearchParams, Event, fetch,
    UIkit: { notification(value) { notifications.push(value); }, offcanvas() { return { show() {} }; } }
  };
  assert.ok(source.startsWith('import UIkit from "uikit";'));
  const code = source.replace('import UIkit from "uikit";', "");
  await new Script("(async () => {\n" + code + "\n})()", { filename: "studio.js" }).runInNewContext(context);
  calls.length = 0;
  get("[data-studio-commit-message]").value = "Update fixture theme";
  return { get, calls, confirmations, notifications };
}
const click = (c, attribute) => c.get("[" + attribute + "]").trigger("click");
const writes = c => c.calls.filter(c => c.options.method === "POST");

test("loading a clean saved branch does not request remote verification", async () => {
  const c = await client();
  assert.equal(writes(c).length, 0);
  assert.equal(c.get("[data-studio-git-remote-verify]").disabled, false);
  assert.match(c.get("[data-studio-git-notice]").textContent, /startet keine GitHub Actions/);
});

test("save sends only the prepare request and shows full SHA, local report and pending CI", async () => {
  const c = await client({ cleanStudio: false });
  await click(c, "data-studio-git-publish");
  assert.deepEqual(writes(c).map(c => c.url), ["/__studio/git/publish"]);
  const report = c.get("[data-studio-git-result]").textContent;
  assert.ok(report.includes(sha)); assert.ok(report.includes("fixture local report"));
  assert.match(report, /Remote-CI ausstehend/);
  assert.equal(c.confirmations.length, 0);
  assert.equal(c.get("[data-studio-git-remote-verify]").disabled, false);
});

test("only explicit confirmed remote action sends the saved exact SHA", async () => {
  const c = await client(); await click(c, "data-studio-git-remote-verify");
  assert.equal(c.confirmations.length, 1); assert.ok(c.confirmations[0].includes(sha));
  assert.deepEqual(writes(c).map(c => c.url), ["/__studio/git/remote-verify"]);
  assert.deepEqual(JSON.parse(writes(c)[0].options.body), { commitSha: sha, confirmRemoteVerification: true });
  assert.match(c.get("[data-studio-git-result]").textContent, /angefordert/);
  assert.match(c.get("[data-studio-git-result]").textContent, /Ergebnis ist noch nicht/);
});

test("cancelling remote confirmation makes no API call", async () => {
  const c = await client({ confirmed: false }); await click(c, "data-studio-git-remote-verify");
  assert.equal(c.confirmations.length, 1); assert.equal(c.calls.length, 0);
});

test("unsaved editor changes block both save-to-Git and remote actions", async () => {
  const c = await client(); c.get("[data-studio-editor]").value = "@color: green;";
  await c.get("[data-studio-editor]").trigger("input");
  assert.equal(c.get("[data-studio-git-remote-verify]").disabled, true);
  await click(c, "data-studio-git-remote-verify"); await click(c, "data-studio-git-publish");
  assert.equal(writes(c).length, 0); assert.equal(c.confirmations.length, 0);
  assert.match(c.get("[data-studio-error]").textContent, /Zuerst speichern/);
});

test("saving a new file edit invalidates the remote candidate without starting CI", async () => {
  const c = await client(); c.get("[data-studio-editor]").value = "@color: green;";
  await click(c, "data-studio-save");
  assert.equal(c.get("[data-studio-git-remote-verify]").disabled, true);
  assert.equal(writes(c).length, 0);
  assert.deepEqual(c.calls.map(c => c.url), ["/__studio/file"]);
});

test("prepare error shows failure and releases UI locks without a remote request", async () => {
  const c = await client({ fail: "/git/publish" }); await click(c, "data-studio-git-publish");
  assert.match(c.get("[data-studio-git-result]").textContent, /Fixture backend failure/);
  assert.equal(c.get("[data-studio-git-publish]").disabled, false);
  assert.equal(c.get("[data-studio-editor]").disabled, false);
  assert.equal(c.get("[data-studio-git-remote-verify]").disabled, true);
  assert.equal(c.notifications.length, 0); assert.equal(writes(c).length, 1);
});

test("a pending save locks competing actions and prevents duplicate submissions", async () => {
  let release; const pending = new Promise(done => { release = done; });
  const c = await client({ pausePublish: pending });
  const saving = click(c, "data-studio-git-publish");
  assert.equal(c.get("[data-studio-editor]").disabled, true);
  assert.equal(c.get("[data-studio-git-remote-verify]").disabled, true);
  await click(c, "data-studio-git-publish"); await click(c, "data-studio-git-remote-verify"); await click(c, "data-studio-save");
  assert.equal(writes(c).length, 1); release(); await saving;
  assert.equal(c.get("[data-studio-editor]").disabled, false);
});

test("remote button remains unavailable on main and requests no CI", async () => {
  const c = await client({ cleanStudio: false });
  assert.equal(c.get("[data-studio-git-remote-verify]").disabled, true);
  await click(c, "data-studio-git-remote-verify");
  assert.equal(c.confirmations.length, 0); assert.equal(writes(c).length, 0);
});

test("already existing verify ref is not described as a newly started run", async () => {
  const c = await client({ existingVerify: true }); await click(c, "data-studio-git-remote-verify");
  assert.match(c.get("[data-studio-git-result]").textContent, /Kein weiterer Lauf angefordert/);
  assert.doesNotMatch(c.get("[data-studio-git-result]").textContent, /CI gestartet/);
});

test("local-only verification sends no publish or remote request", async () => {
  const c = await client(); await click(c, "data-studio-git-verify");
  assert.deepEqual(writes(c).map(c => c.url), ["/__studio/git/verify"]);
});

test("Studio markup distinguishes save and remote controls with an initially disabled remote button", () => {
  assert.match(partial, /data-studio-git-publish>Vorbereiten und sichern \(ohne Actions\)/);
  assert.match(partial, /data-studio-git-remote-verify disabled/);
  assert.match(partial, /aria-live="polite"/);
  assert.doesNotMatch(partial, /Push \+ CI/);
  assert.ok(partial.includes("Das Studio erstellt keinen Pull Request"));
});
