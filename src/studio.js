import UIkit from "uikit";

const endpoint = "/__studio";
const studioElement = document.querySelector("#kalkurama-studio");
const unavailable = document.querySelector("[data-studio-unavailable]");
const workspace = document.querySelector("[data-studio-workspace]");
const errorBox = document.querySelector("[data-studio-error]");
const fileSelect = document.querySelector("[data-studio-file]");
const editor = document.querySelector("[data-studio-editor]");
const modeLabel = document.querySelector("[data-studio-mode]");
const typeLabel = document.querySelector("[data-studio-type]");
const branchLabel = document.querySelector("[data-studio-branch]");
const stateLabel = document.querySelector("[data-studio-state]");
const gitStatusLabel = document.querySelector("[data-studio-git-status]");
const diffOutput = document.querySelector("[data-studio-diff]");
const saveButton = document.querySelector("[data-studio-save]");
const reloadButton = document.querySelector("[data-studio-reload]");
const resetButton = document.querySelector("[data-studio-reset]");

const mainSyncLabel = document.querySelector("[data-studio-main-sync]");
const gitNotice = document.querySelector("[data-studio-git-notice]");
const commitMessageInput = document.querySelector("[data-studio-commit-message]");
const gitVerifyButton = document.querySelector("[data-studio-git-verify]");
const gitPublishButton = document.querySelector("[data-studio-git-publish]");
const gitRemoteVerifyButton = document.querySelector("[data-studio-git-remote-verify]");
const gitResult = document.querySelector("[data-studio-git-result]");

let studioAvailable = false;
let currentFile = null;
let loadedContent = "";
let gitBusy = false;
let fileSaving = false;
let candidate = null;

function setError(message = "") {
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.classList.toggle("uk-hidden", !message);
}

function setState(message) {
  if (stateLabel) stateLabel.textContent = message;
}

function setWorkspaceAvailable(available) {
  studioAvailable = available;
  updateRemoteControl();
  unavailable?.classList.toggle("uk-hidden", available);
  workspace?.classList.toggle("uk-hidden", !available);

  document.querySelectorAll("[data-studio-open]").forEach((button) => {
    button.disabled = !available;
    button.setAttribute("aria-disabled", String(!available));
    if (!available) button.title = "Nur lokal im Vite-Development-Modus verfügbar";
  });
}

function renderGitStatus(git) {
  if (!git) return;
  candidate = git.branch?.startsWith("studio/") && git.mainSynchronized && !git.syncError
    && git.changes?.length === 0 && /^[0-9a-f]{40}$/.test(git.commitSha ?? "")
    ? { branch: git.branch, commitSha: git.commitSha } : null;
  updateRemoteControl();

  if (mainSyncLabel) {
    mainSyncLabel.textContent = git.mainSynchronized ? "main aktuell" : "main prüfen";
    mainSyncLabel.className = "uk-label" + (git.mainSynchronized ? " uk-label-success" : " uk-label-warning");
  }

  if (gitNotice && git.syncError) {
    gitNotice.textContent = git.syncError;
  } else if (gitNotice) {
    gitNotice.textContent = "Es werden ausschließlich freigegebene Studio-Dateien synchronisiert. " +
      "Das Studio erstellt keinen Pull Request. Vorbereiten und sichern startet keine GitHub Actions. " +
      "Die GitHub-Prüfung wird nur separat und nach ausdrücklicher Bestätigung angefordert.";
  }
}

function hasUnsavedEditorChanges() {
  return Boolean(currentFile && editor && editor.value !== loadedContent);
}

function assertSavedEditor() {
  if (hasUnsavedEditorChanges()) {
    throw new Error("Ungespeicherte Studio-Änderungen vorhanden. Zuerst speichern.");
  }
}

function confirmDiscardUnsavedChanges(message) {
  if (!hasUnsavedEditorChanges()) return true;
  return window.confirm(message);
}

function updateRemoteControl() {
  if (gitRemoteVerifyButton) {
    gitRemoteVerifyButton.disabled = gitBusy || fileSaving || !studioAvailable || !candidate || hasUnsavedEditorChanges();
  }
}

function setGitBusy(busy) {
  gitBusy = busy;
  if (gitVerifyButton) gitVerifyButton.disabled = busy || fileSaving;
  if (gitPublishButton) gitPublishButton.disabled = busy || fileSaving;
  for (const control of [saveButton, reloadButton, resetButton, fileSelect, editor, commitMessageInput]) {
    if (control) control.disabled = busy || fileSaving;
  }
  updateRemoteControl();
}

function renderFile(file) {
  currentFile = file;
  loadedContent = file.content;
  if (typeLabel) typeLabel.textContent = file.type === "markup" ? "Markup" : "Theme";
  editor.value = file.content;
  diffOutput.textContent = file.diff || "Keine Änderungen.";
  gitStatusLabel.textContent = file.gitStatus || "clean";
  gitStatusLabel.className = "uk-label" + (file.modified ? " uk-label-warning" : " uk-label-success");
  setState(file.modified ? "Geändert" : "HEAD");
  setError("");
  updateRemoteControl();
}

async function api(path, options = {}) {
  const response = await fetch(endpoint + path, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({
    ok: false,
    error: "Ungültige Kalkurama-Studio-Antwort."
  }));

  if (!response.ok) {
    const error = new Error(payload.error || "Kalkurama Studio request failed.");
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function loadFile(path) {
  setState("Lade …");
  const payload = await api("/file?path=" + encodeURIComponent(path));
  renderFile(payload.file);
  if (fileSelect && fileSelect.value !== path) fileSelect.value = path;
}

async function loadStatus() {
  try {
    const payload = await api("/status");
    setWorkspaceAvailable(true);
    modeLabel.textContent = payload.mode || "kalkurama";
    branchLabel.textContent = [payload.branch, payload.head].filter(Boolean).join(" · ");
    renderGitStatus(payload.git);

    fileSelect.replaceChildren(
      ...payload.files.map((path) => {
        const option = document.createElement("option");
        option.value = path;
        option.textContent = path;
        return option;
      })
    );

    const requested = new URLSearchParams(window.location.search).get("studio");
    const firstFile = payload.files.includes(requested)
      ? requested
      : payload.files.includes("src/themes/kalkurama/variables.less")
        ? "src/themes/kalkurama/variables.less"
        : payload.files[0];

    if (firstFile) await loadFile(firstFile);
  } catch {
    setWorkspaceAvailable(false);
  }
}

async function saveCurrentFile() {
  if (!studioAvailable || !currentFile || gitBusy || fileSaving) return;

  fileSaving = true;
  candidate = null;
  setGitBusy(false);
  setState(currentFile.type === "markup" ? "Prüfe Markup …" : "Kompiliere Theme …");
  setError("");

  try {
    const payload = await api("/file", {
      method: "PUT",
      body: JSON.stringify({ path: currentFile.path, content: editor.value })
    });

    renderFile(payload.file);
    const changed = Boolean(payload.compiled?.length || payload.validated?.length);
    setState(changed ? (payload.type === "markup" ? "Markup gespeichert & geprüft" : "Theme gespeichert & kompiliert") : "Keine Änderung");

    UIkit.notification({
      message: changed ? (payload.type === "markup" ? "Markup gespeichert und geprüft." : "Theme gespeichert und kompiliert.") : "Keine Änderung.",
      status: "success",
      pos: "bottom-right",
      timeout: 2200
    });
  } catch (error) {
    setState(error.payload?.rolledBack
      ? (currentFile?.type === "markup" ? "Markup-Fehler · zurückgesetzt" : "Compile-Fehler · zurückgesetzt")
      : "Fehler");
    setError(error.message);
  } finally {
    fileSaving = false;
    setGitBusy(false);
  }
}

async function verifyGitCandidate() {
  if (gitBusy || fileSaving) return;
  try {
    assertSavedEditor();
    setGitBusy(true);
    setError("");
    gitResult.textContent = "Lokale Vollprüfung läuft …";

    const payload = await api("/git/verify", {
      method: "POST",
      body: "{}"
    });

    gitResult.textContent = [
      "Lokale Prüfung erfolgreich.",
      "",
      payload.verification?.output || "",
      "",
      "Branch: " + (payload.git?.branch || "—"),
      "HEAD: " + (payload.git?.head || "—")
    ].join("\n").trim();

    renderGitStatus(payload.git);

    UIkit.notification({
      message: "Lokale Vollprüfung erfolgreich.",
      status: "success",
      pos: "bottom-right",
      timeout: 2200
    });
  } catch (error) {
    setError(error.message);
    gitResult.textContent = error.message;
  } finally {
    setGitBusy(false);
  }
}

async function publishGitCandidate() {
  if (gitBusy || fileSaving) return;
  candidate = null;
  try {
    assertSavedEditor();
    setGitBusy(true);
    setError("");
    gitResult.textContent = "Prüfe finalen Kandidaten …";

    const payload = await api("/git/publish", {
      method: "POST",
      body: JSON.stringify({
        message: commitMessageInput?.value || ""
      })
    });

    gitResult.textContent = [
      "Lokal geprüft und auf GitHub gesichert.",
      "Remote-CI ausstehend. Mit dieser Aktion wurde keine GitHub-Prüfung gestartet.",
      "",
      "Entwicklungsbranch: " + payload.branch,
      "Commit: " + payload.commitSha,
      "",
      payload.verification?.output || "",
      "",
      "Kein Pull Request wurde erstellt."
    ].join("\n");

    UIkit.notification({
      message: "Auf GitHub gesichert. Remote-CI ausstehend.",
      status: "success",
      pos: "bottom-right",
      timeout: 3000
    });

    const selectedPath = currentFile?.path;
    await loadStatus();
    if (selectedPath && [...fileSelect.options].some((option) => option.value === selectedPath)) {
      await loadFile(selectedPath);
    }
  } catch (error) {
    setError(error.message);
    gitResult.textContent = error.message;
  } finally {
    setGitBusy(false);
  }
}

async function startRemoteGitVerification() {
  if (gitBusy || fileSaving) return;
  try {
    assertSavedEditor();
    if (!candidate) throw new Error("Zuerst einen unveränderten Studio-Stand vorbereiten und sichern.");
    const requested = { ...candidate };
    if (!window.confirm("GitHub Actions für diesen Commit anfordern?\n" + requested.commitSha +
      "\nNur starten, wenn dein Actions-Kontingent verfügbar ist.")) return;
    setGitBusy(true);
    setError("");
    gitResult.textContent = "Prüfe den gesicherten Stand vor der GitHub-Anforderung ...";
    const payload = await api("/git/remote-verify", {
      method: "POST",
      body: JSON.stringify({ commitSha: requested.commitSha, confirmRemoteVerification: true })
    });
    const status = payload.verifyCreated
      ? "GitHub-Prüfung angefordert. Das Ergebnis ist noch nicht geprüft."
      : "Für diesen Commit existiert bereits ein Prüfbranch. Kein weiterer Lauf angefordert.";
    gitResult.textContent = [
      status, "", "Entwicklungsbranch: " + payload.branch, "Commit: " + payload.commitSha,
      "Prüfbranch: " + payload.verifyBranch, "", payload.verification?.output || "",
      "", "Ein Prüfbranch ist keine grüne CI. Kein Pull Request wurde erstellt."
    ].join("\n");
    UIkit.notification({ message: status, status: "primary", pos: "bottom-right", timeout: 4000 });
  } catch (error) {
    candidate = null;
    setError(error.message);
    gitResult.textContent = error.message;
  } finally {
    setGitBusy(false);
  }
}

fileSelect?.addEventListener("change", async () => {
  const nextPath = fileSelect.value;
  if (!confirmDiscardUnsavedChanges("Ungespeicherte Studio-Änderungen verwerfen und Datei wechseln?")) {
    if (currentFile) fileSelect.value = currentFile.path;
    return;
  }
  await loadFile(nextPath);
});
saveButton?.addEventListener("click", saveCurrentFile);
reloadButton?.addEventListener("click", async () => {
  if (!currentFile) return;
  if (!confirmDiscardUnsavedChanges("Ungespeicherte Studio-Änderungen verwerfen und Datei neu laden?")) return;
  await loadFile(currentFile.path);
});
resetButton?.addEventListener("click", () => {
  if (!currentFile) return;
  if (!confirmDiscardUnsavedChanges("Ungespeicherte Studio-Änderungen verwerfen und HEAD übernehmen?")) return;
  editor.value = currentFile.headContent;
  updateRemoteControl();
  setState("HEAD im Editor · noch nicht gespeichert");
});

gitVerifyButton?.addEventListener("click", verifyGitCandidate);
gitPublishButton?.addEventListener("click", publishGitCandidate);
gitRemoteVerifyButton?.addEventListener("click", startRemoteGitVerification);

editor?.addEventListener("input", () => {
  if (!currentFile) return;
  updateRemoteControl();
  setState(editor.value === loadedContent ? (currentFile.modified ? "Geändert" : "HEAD") : "Ungespeichert");
});

editor?.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    editor.setRangeText("  ", editor.selectionStart, editor.selectionEnd, "end");
    editor.dispatchEvent(new Event("input"));
    return;
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveCurrentFile();
  }
});

window.addEventListener("beforeunload", (event) => {
  if (!hasUnsavedEditorChanges()) return;
  event.preventDefault();
  event.returnValue = "";
});

document.querySelectorAll("[data-studio-open]").forEach((button) => {
  button.addEventListener("click", async () => {
    if (!studioAvailable) return;
    const path = button.dataset.studioOpen;
    if (path && path !== currentFile?.path) {
      if (!confirmDiscardUnsavedChanges("Ungespeicherte Studio-Änderungen verwerfen und andere Datei öffnen?")) return;
      await loadFile(path);
    }
    UIkit.offcanvas(studioElement)?.show();
  });
});

await loadStatus();
