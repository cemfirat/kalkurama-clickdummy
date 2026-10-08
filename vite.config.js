import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import less from "less";
import { defineConfig } from "vite";

const rootDirectory = process.cwd();

const htmlEntries = {
  workspace: "index.html",
  overview: "overview.html",
  project: "project.html",
  estimates: "estimates.html",
  estimate: "estimate.html",
  invoices: "invoices.html",
  invoice: "invoice.html",
  payments: "payments.html",
  creditNotes: "credit-notes.html",
  services: "services.html",
  work: "work.html",
  workCorrectionFixed: "work-correction-fixed.html",
  workCorrectionQuantity: "work-correction-quantity.html",
  workCorrectionExpense: "work-correction-expense.html",
  time: "time.html",
  settings: "settings.html",
  styleguide: "styleguide.html"
};

const themeEntries = {
  standard: "src/themes/standard.less",
  kalkurama: "src/themes/kalkurama.less",
  pages: "src/themes/kalkurama.less"
};

const includePattern = /<!--\s*@include\s+([^\s]+)(?:\s+(\{[\s\S]*?\}))?\s*-->/g;
const includeCodePattern = /<!--\s*@include-code\s+([^\s]+)(?:\s+(\{[\s\S]*?\}))?\s*-->/g;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyVariables(source, variables) {
  return source.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (_, key) => {
    if (!(key in variables)) throw new Error("Missing HTML partial variable: " + key);
    return escapeHtml(variables[key]);
  });
}

function readPartial(relativePath, rawVariables) {
  const partialPath = resolve(rootDirectory, relativePath);
  const variables = rawVariables ? JSON.parse(rawVariables) : {};
  return applyVariables(readFileSync(partialPath, "utf8"), variables);
}

function expandHtmlPartials(source, depth = 0) {
  if (depth > 12) throw new Error("HTML partial nesting is too deep.");

  return source.replace(includePattern, (_, relativePath, rawVariables) => {
    const partial = readPartial(relativePath, rawVariables);
    return expandHtmlPartials(partial, depth + 1);
  });
}

function expandCodePartials(source) {
  return source.replace(includeCodePattern, (_, relativePath, rawVariables) => {
    const partial = readPartial(relativePath, rawVariables).trim();
    return escapeHtml(partial);
  });
}

function htmlPartialsPlugin() {
  const partialsDirectory = resolve(rootDirectory, "partials");

  return {
    name: "kalkurama-html-partials",
    enforce: "pre",
    transformIndexHtml(html) {
      return expandHtmlPartials(expandCodePartials(html));
    },
    configureServer(server) {
      server.watcher.add(partialsDirectory);
      server.watcher.on("change", (file) => {
        if (file.startsWith(partialsDirectory)) {
          server.ws.send({ type: "full-reload" });
        }
      });
    }
  };
}

function normalizeStudioPath(value) {
  return String(value ?? "").replaceAll("\\", "/").replace(/^\.\//, "");
}

function listThemeStudioFiles() {
  const files = ["src/themes/kalkurama.less"];
  const kalkuramaDirectory = resolve(rootDirectory, "src/themes/kalkurama");

  for (const entry of readdirSync(kalkuramaDirectory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".less")) {
      files.push("src/themes/kalkurama/" + entry.name);
    }
  }

  const customersDirectory = resolve(rootDirectory, "src/themes/customers");
  for (const entry of readdirSync(customersDirectory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".less")) {
      files.push("src/themes/customers/" + entry.name);
    }

    if (!entry.isDirectory()) continue;

    const customerDirectory = resolve(customersDirectory, entry.name);
    for (const child of readdirSync(customerDirectory, { withFileTypes: true })) {
      if (child.isFile() && child.name.endsWith(".less")) {
        files.push("src/themes/customers/" + entry.name + "/" + child.name);
      }
    }
  }

  return [...new Set(files)].sort();
}

function listMarkupStudioFiles() {
  const files = Object.values(htmlEntries);

  function collectHtmlFiles(directory, prefix) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const relativePath = prefix + "/" + entry.name;
      const absolutePath = resolve(rootDirectory, relativePath);

      if (entry.isDirectory()) {
        collectHtmlFiles(absolutePath, relativePath);
        continue;
      }

      if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
      if (relativePath === "partials/theme-studio.html") continue;

      files.push(relativePath);
    }
  }

  collectHtmlFiles(resolve(rootDirectory, "partials"), "partials");

  return [...new Set(files)].sort();
}

function listStudioFiles() {
  return [...new Set([
    ...listThemeStudioFiles(),
    ...listMarkupStudioFiles()
  ])].sort();
}

function assertStudioFile(value) {
  const relativePath = normalizeStudioPath(value);
  if (!listStudioFiles().includes(relativePath)) {
    throw new Error("Studio path is not editable: " + relativePath);
  }
  return relativePath;
}

function studioFileType(relativePath) {
  return relativePath.endsWith(".less") ? "theme" : "markup";
}

function validateMarkupSources() {
  for (const relativePath of Object.values(htmlEntries)) {
    const source = readFileSync(resolve(rootDirectory, relativePath), "utf8");
    expandHtmlPartials(expandCodePartials(source));
  }
}

function customerThemeEntries() {
  const customersDirectory = resolve(rootDirectory, "src/themes/customers");
  return readdirSync(customersDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".less"))
    .map((entry) => "src/themes/customers/" + entry.name)
    .sort();
}

function affectedThemeEntries(relativePath) {
  if (relativePath === "src/themes/kalkurama.less" || relativePath.startsWith("src/themes/kalkurama/")) {
    return ["src/themes/kalkurama.less", ...customerThemeEntries()];
  }

  const customerMatch = relativePath.match(/^src\/themes\/customers\/([^/]+)(?:\/|\.less$)/);
  if (customerMatch) {
    return ["src/themes/customers/" + customerMatch[1] + ".less"];
  }

  return [];
}

async function compileThemeEntry(relativePath) {
  const filename = resolve(rootDirectory, relativePath);
  await less.render(readFileSync(filename, "utf8"), {
    filename,
    javascriptEnabled: false,
    paths: [rootDirectory, resolve(rootDirectory, "node_modules")]
  });
}

function gitRaw(args) {
  return execFileSync("git", args, {
    cwd: rootDirectory,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function git(args) {
  return gitRaw(args).trim();
}

function gitOptional(args) {
  try {
    return git(args);
  } catch {
    return "";
  }
}

function gitRawOptional(args) {
  try {
    return gitRaw(args);
  } catch {
    return "";
  }
}

function readHeadFile(relativePath) {
  return gitRawOptional(["show", "HEAD:" + relativePath]);
}

function parseGitStatus() {
  const output = gitRawOptional(["status", "--porcelain=v1", "--untracked-files=all"]);
  if (!output.trim()) return [];

  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => ({
      index: line[0],
      worktree: line[1],
      path: line.slice(3).trim()
    }));
}

function assertGitHubOrigin() {
  const origin = gitOptional(["remote", "get-url", "origin"]);
  const allowed = new Set([
    "https://github.com/cemfirat/kalkurama-clickdummy.git",
    "https://github.com/cemfirat/kalkurama-clickdummy",
    "git@github.com:cemfirat/kalkurama-clickdummy.git"
  ]);

  if (!allowed.has(origin)) {
    throw new Error("Git Sync requires origin to be cemfirat/kalkurama-clickdummy.");
  }

  return origin;
}

function assertStudioGitState() {
  const branch = gitOptional(["branch", "--show-current"]);
  if (branch === "") throw new Error("Git Sync does not support detached HEAD.");
  if (branch !== "main" && !branch.startsWith("studio/")) {
    throw new Error("Git Sync must start from main or an existing studio/* branch.");
  }

  const allowedFiles = new Set(listStudioFiles());
  const changes = parseGitStatus();

  for (const change of changes) {
    if (change.index !== " " && change.index !== "?") {
      throw new Error("Git Sync found staged changes. Unstage them before using Theme Studio Git Sync.");
    }

    if (change.path.includes(" -> ")) {
      throw new Error("Git Sync does not support renamed files.");
    }

    if (!allowedFiles.has(change.path)) {
      throw new Error("Git Sync found a non-Theme-Studio change: " + change.path);
    }
  }

  return { branch, changes };
}

function fetchAndAssertCurrentMain(branch) {
  assertGitHubOrigin();

  execFileSync("git", ["fetch", "--quiet", "origin", "main"], {
    cwd: rootDirectory,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 60000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }
  });

  if (branch === "main") {
    const localMain = git(["rev-parse", "main"]);
    const originMain = git(["rev-parse", "origin/main"]);

    if (localMain !== originMain) {
      throw new Error("Local main is not synchronized with origin/main. Update main before Git Sync.");
    }

    return;
  }

  try {
    execFileSync("git", ["merge-base", "--is-ancestor", "origin/main", "HEAD"], {
      cwd: rootDirectory,
      stdio: ["ignore", "ignore", "ignore"],
      timeout: 10000
    });
  } catch {
    throw new Error("This studio branch does not contain the current origin/main. Rebase/update it before Git Sync.");
  }
}

function runNpmScript(script) {
  return execFileSync("npm", ["run", script], {
    cwd: rootDirectory,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120000,
    maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, CI: "1" }
  });
}

function runLocalVerification() {
  try {
    const verifyOutput = runNpmScript("verify");
    const transferOutput = runNpmScript("transfer:status");
    const output = [verifyOutput, transferOutput].join("\n");

    return {
      ok: true,
      output: output.slice(-12000)
    };
  } catch (error) {
    const stdout = typeof error?.stdout === "string" ? error.stdout : "";
    const stderr = typeof error?.stderr === "string" ? error.stderr : "";
    const message = [stdout, stderr, error instanceof Error ? error.message : String(error)]
      .filter(Boolean)
      .join("\n")
      .slice(-12000);

    const verificationError = new Error("Local verification failed.\n" + message);
    verificationError.code = "VERIFY_FAILED";
    throw verificationError;
  }
}

function sanitizeCommitMessage(value) {
  const message = String(value ?? "").trim();

  if (message.length < 5 || message.length > 120 || /[\r\n]/.test(message)) {
    throw new Error("Commit message must contain 5–120 characters on one line.");
  }

  return message;
}

function assertGitIdentity() {
  const name = gitOptional(["config", "user.name"]);
  const email = gitOptional(["config", "user.email"]);

  if (name === "" || email === "") {
    throw new Error("Git user.name and user.email must be configured before Git Sync.");
  }

  return { name, email };
}

function gitRemoteOptional(args) {
  try {
    return execFileSync("git", args, {
      cwd: rootDirectory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 60000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }
    }).trim();
  } catch {
    return "";
  }
}

function createStudioBranchName() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return "studio/ui-" + stamp;
}

function ensureStudioBranch(currentBranch) {
  if (currentBranch.startsWith("studio/")) return currentBranch;

  const branch = createStudioBranchName();
  git(["switch", "-c", branch]);
  return branch;
}

function pushGitRef(args) {
  return execFileSync("git", ["push", ...args], {
    cwd: rootDirectory,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 60000,
    maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }
  }).trim();
}

function studioGitStatus() {
  const branch = gitOptional(["branch", "--show-current"]);
  const changes = parseGitStatus();
  const origin = gitOptional(["remote", "get-url", "origin"]);
  let mainSynchronized = false;
  let syncError = "";

  try {
    const state = assertStudioGitState();
    assertGitHubOrigin();

    if (state.branch === "main") {
      const originMain = gitOptional(["rev-parse", "origin/main"]);
      mainSynchronized = originMain !== "" && git(["rev-parse", "main"]) === originMain;
    } else {
      try {
        execFileSync("git", ["merge-base", "--is-ancestor", "origin/main", "HEAD"], {
          cwd: rootDirectory,
          stdio: ["ignore", "ignore", "ignore"],
          timeout: 10000
        });
        mainSynchronized = true;
      } catch {
        mainSynchronized = false;
      }
    }
  } catch (error) {
    syncError = error instanceof Error ? error.message : String(error);
  }

  return {
    branch,
    head: gitOptional(["rev-parse", "--short", "HEAD"]),
    origin,
    mainSynchronized,
    syncError,
    changes
  };
}

function publishStudioChanges(commitMessage) {
  const message = sanitizeCommitMessage(commitMessage);
  const state = assertStudioGitState();

  fetchAndAssertCurrentMain(state.branch);

  const hasWorkingChanges = state.changes.length > 0;
  assertGitIdentity();
  const verification = runLocalVerification();
  let branch = state.branch;

  if (hasWorkingChanges) {
    branch = ensureStudioBranch(branch);
    const paths = state.changes.map((change) => change.path);

    gitRaw(["add", "--", ...paths]);

    const staged = git(["diff", "--cached", "--name-only"])
      .split("\n")
      .filter(Boolean);

    const allowed = new Set(listStudioFiles());
    if (staged.length === 0 || staged.some((path) => !allowed.has(path))) {
      gitRawOptional(["reset", "--", ...paths]);
      throw new Error("Git Sync staging did not produce an allowed Theme Studio candidate.");
    }

    try {
      gitRaw(["commit", "-m", message]);
    } catch (error) {
      gitRawOptional(["reset", "--", ...paths]);
      throw error;
    }
  } else if (!branch.startsWith("studio/") || git(["rev-parse", "HEAD"]) === git(["rev-parse", "origin/main"])) {
    throw new Error("There are no Theme Studio changes to publish.");
  }

  const commitSha = git(["rev-parse", "HEAD"]);
  const shortSha = commitSha.slice(0, 12);
  const verifyBranch = "verify/studio-ui-" + shortSha;

  pushGitRef(["-u", "origin", branch]);

  const remoteVerify = gitRemoteOptional(["ls-remote", "--heads", "origin", "refs/heads/" + verifyBranch]);
  let verifyCreated = false;

  if (remoteVerify === "") {
    pushGitRef(["origin", commitSha + ":refs/heads/" + verifyBranch]);
    verifyCreated = true;
  } else if (!remoteVerify.startsWith(commitSha)) {
    throw new Error("Verify branch already exists with a different commit: " + verifyBranch);
  }

  return {
    ok: true,
    branch,
    commitSha,
    verifyBranch,
    verifyCreated,
    verification
  };
}

function studioFilePayload(relativePath) {
  const absolutePath = resolve(rootDirectory, relativePath);
  const content = readFileSync(absolutePath, "utf8");
  const headContent = readHeadFile(relativePath);

  return {
    path: relativePath,
    type: studioFileType(relativePath),
    content,
    headContent,
    modified: content !== headContent,
    gitStatus: gitOptional(["status", "--short", "--", relativePath]),
    diff: gitOptional(["diff", "--", relativePath])
  };
}

function isLoopbackRequest(req) {
  const address = String(req.socket.remoteAddress ?? "").replace(/^::ffff:/, "");
  return address === "127.0.0.1" || address === "::1";
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 512 * 1024) {
        rejectBody(new Error("Theme Studio request body is too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolveBody(raw ? JSON.parse(raw) : {});
      } catch {
        rejectBody(new Error("Invalid JSON request."));
      }
    });

    req.on("error", rejectBody);
  });
}

function themeStudioPlugin(mode) {
  return {
    name: "kalkurama-theme-studio",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1");
        if (!requestUrl.pathname.startsWith("/__studio/")) {
          next();
          return;
        }

        const handle = async () => {
          if (!isLoopbackRequest(req)) {
            sendJson(res, 403, { ok: false, error: "Theme Studio is local-only." });
            return;
          }

          if (req.method === "GET" && requestUrl.pathname === "/__studio/status") {
            const files = listStudioFiles();
            sendJson(res, 200, {
              ok: true,
              mode,
              branch: gitOptional(["branch", "--show-current"]),
              head: gitOptional(["rev-parse", "--short", "HEAD"]),
              files,
              modifiedFiles: files.filter((path) => Boolean(gitOptional(["status", "--short", "--", path]))),
              git: studioGitStatus()
            });
            return;
          }

          if (req.method === "GET" && requestUrl.pathname === "/__studio/file") {
            const relativePath = assertStudioFile(requestUrl.searchParams.get("path"));
            sendJson(res, 200, { ok: true, file: studioFilePayload(relativePath) });
            return;
          }

          if (req.method === "PUT" && requestUrl.pathname === "/__studio/file") {
            const body = await readJsonBody(req);
            const relativePath = assertStudioFile(body.path);
            const nextContent = String(body.content ?? "");
            const absolutePath = resolve(rootDirectory, relativePath);
            const previousContent = readFileSync(absolutePath, "utf8");

            if (nextContent === previousContent) {
              sendJson(res, 200, { ok: true, compiled: [], file: studioFilePayload(relativePath) });
              return;
            }

            writeFileSync(absolutePath, nextContent, "utf8");

            try {
              const type = studioFileType(relativePath);
              const compiled = [];

              if (type === "theme") {
                compiled.push(...affectedThemeEntries(relativePath));
                for (const entry of compiled) {
                  await compileThemeEntry(entry);
                }
              } else {
                validateMarkupSources();
              }

              sendJson(res, 200, {
                ok: true,
                type,
                compiled,
                validated: type === "markup" ? ["markup"] : [],
                file: studioFilePayload(relativePath)
              });
            } catch (error) {
              writeFileSync(absolutePath, previousContent, "utf8");
              sendJson(res, 422, {
                ok: false,
                error: error instanceof Error ? error.message : String(error),
                rolledBack: true,
                file: studioFilePayload(relativePath)
              });
            }
            return;
          }

          if (req.method === "POST" && requestUrl.pathname === "/__studio/git/verify") {
            const state = assertStudioGitState();
            fetchAndAssertCurrentMain(state.branch);
            const verification = runLocalVerification();
            sendJson(res, 200, {
              ok: true,
              verification,
              git: studioGitStatus()
            });
            return;
          }

          if (req.method === "POST" && requestUrl.pathname === "/__studio/git/publish") {
            const body = await readJsonBody(req);
            const result = publishStudioChanges(body.message);
            sendJson(res, 200, result);
            return;
          }

          sendJson(res, 404, { ok: false, error: "Unknown Theme Studio endpoint." });
        };

        handle().catch((error) => {
          sendJson(res, 500, {
            ok: false,
            error: error instanceof Error ? error.message : String(error)
          });
        });
      });
    }
  };
}

function resolveThemeEntry(mode) {
  const relative = themeEntries[mode] ?? themeEntries.kalkurama;
  return resolve(rootDirectory, relative);
}

export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/kalkurama-clickdummy/" : "/",
  plugins: [htmlPartialsPlugin(), themeStudioPlugin(mode)],
  resolve: {
    alias: {
      "@kalkurama-theme": resolveThemeEntry(mode)
    }
  },
  define: {
    __KALKURAMA_THEME__: JSON.stringify(mode === "pages" ? "kalkurama" : (themeEntries[mode] ? mode : "kalkurama"))
  },
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(htmlEntries).map(([name, file]) => [name, resolve(rootDirectory, file)])
      )
    }
  }
}));
