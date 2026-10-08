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
  invoices: "invoices.html",
  payments: "payments.html",
  creditNotes: "credit-notes.html",
  services: "services.html",
  work: "work.html",
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

function assertThemeStudioFile(value) {
  const relativePath = normalizeStudioPath(value);
  if (!listThemeStudioFiles().includes(relativePath)) {
    throw new Error("Theme Studio path is not editable: " + relativePath);
  }
  return relativePath;
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

function studioFilePayload(relativePath) {
  const absolutePath = resolve(rootDirectory, relativePath);
  const content = readFileSync(absolutePath, "utf8");
  const headContent = readHeadFile(relativePath);

  return {
    path: relativePath,
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
            const files = listThemeStudioFiles();
            sendJson(res, 200, {
              ok: true,
              mode,
              branch: gitOptional(["branch", "--show-current"]),
              head: gitOptional(["rev-parse", "--short", "HEAD"]),
              files,
              modifiedFiles: files.filter((path) => Boolean(gitOptional(["status", "--short", "--", path])))
            });
            return;
          }

          if (req.method === "GET" && requestUrl.pathname === "/__studio/file") {
            const relativePath = assertThemeStudioFile(requestUrl.searchParams.get("path"));
            sendJson(res, 200, { ok: true, file: studioFilePayload(relativePath) });
            return;
          }

          if (req.method === "PUT" && requestUrl.pathname === "/__studio/file") {
            const body = await readJsonBody(req);
            const relativePath = assertThemeStudioFile(body.path);
            const nextContent = String(body.content ?? "");
            const absolutePath = resolve(rootDirectory, relativePath);
            const previousContent = readFileSync(absolutePath, "utf8");

            if (nextContent === previousContent) {
              sendJson(res, 200, { ok: true, compiled: [], file: studioFilePayload(relativePath) });
              return;
            }

            writeFileSync(absolutePath, nextContent, "utf8");

            try {
              const compiled = affectedThemeEntries(relativePath);
              for (const entry of compiled) {
                await compileThemeEntry(entry);
              }

              sendJson(res, 200, { ok: true, compiled, file: studioFilePayload(relativePath) });
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
