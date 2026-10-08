import UIkit from "uikit";

const endpoint = "/__studio";
const studioElement = document.querySelector("#theme-studio");
const unavailable = document.querySelector("[data-studio-unavailable]");
const workspace = document.querySelector("[data-studio-workspace]");
const errorBox = document.querySelector("[data-studio-error]");
const fileSelect = document.querySelector("[data-studio-file]");
const editor = document.querySelector("[data-studio-editor]");
const modeLabel = document.querySelector("[data-studio-mode]");
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
const gitResult = document.querySelector("[data-studio-git-result]");

let studioAvailable = false;
let currentFile = null;
let loadedContent = "";

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

  if (mainSyncLabel) {
    mainSyncLabel.textContent = git.mainSynchronized ? "main aktuell" : "main prüfen";
    mainSyncLabel.className = "uk-label" + (git.mainSynchronized ? " uk-label-success" : " uk-label-warning");
  }

  if (gitNotice && git.syncError) {
    gitNotice.textContent = git.syncError;
  } else if (gitNotice) {
    gitNotice.innerHTML = "Es werden ausschließlich freigegebene Theme-Dateien synchronisiert. " +
      "Das Studio erstellt keinen Pull Request. Nach dem Push wird ein identischer <code>verify/**</code>-Branch " +
      "erzeugt und damit genau ein Branch-CI-Run gestartet.";
  }
}

function hasUnsavedEditorChanges() {
  return Boolean(currentFile && editor && editor.value !== loadedContent);
}

function assertSavedEditor() {
  if (hasUnsavedEditorChanges()) {
    throw new Error("Ungespeicherte LESS-Änderungen vorhanden. Zuerst Speichern & kompilieren.");
  }
}

function setGitBusy(busy) {
  if (gitVerifyButton) gitVerifyButton.disabled = busy;
  if (gitPublishButton) gitPublishButton.disabled = busy;
}

function renderFile(file) {
  currentFile = file;
  loadedContent = file.content;
  editor.value = file.content;
  diffOutput.textContent = file.diff || "Keine Änderungen.";
  gitStatusLabel.textContent = file.gitStatus || "clean";
  gitStatusLabel.className = "uk-label" + (file.modified ? " uk-label-warning" : " uk-label-success");
  setState(file.modified ? "Geändert" : "HEAD");
  setError("");
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
    error: "Ungültige Theme-Studio-Antwort."
  }));

  if (!response.ok) {
    const error = new Error(payload.error || "Theme Studio request failed.");
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
  if (!studioAvailable || !currentFile) return;

  saveButton.disabled = true;
  setState("Kompiliere …");
  setError("");

  try {
    const payload = await api("/file", {
      method: "PUT",
      body: JSON.stringify({ path: currentFile.path, content: editor.value })
    });

    renderFile(payload.file);
    setState(payload.compiled?.length ? "Gespeichert & kompiliert" : "Keine Änderung");

    UIkit.notification({
      message: payload.compiled?.length ? "Theme gespeichert und kompiliert." : "Keine Änderung.",
      status: "success",
      pos: "bottom-right",
      timeout: 2200
    });
  } catch (error) {
    setState(error.payload?.rolledBack ? "Compile-Fehler · zurückgesetzt" : "Fehler");
    setError(error.message);
  } finally {
    saveButton.disabled = false;
  }
}

async function verifyGitCandidate() {
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
      "Lokal verifiziert, committed und gepusht.",
      "",
      "Feature branch: " + payload.branch,
      "Commit: " + payload.commitSha,
      "Verify branch: " + payload.verifyBranch,
      "",
      "GitHub Branch-CI wurde durch den verify/**-Push gestartet.",
      "Kein Pull Request wurde erstellt."
    ].join("\n");

    UIkit.notification({
      message: "Theme gepusht · Branch-CI gestartet.",
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

fileSelect?.addEventListener("change", () => loadFile(fileSelect.value));
saveButton?.addEventListener("click", saveCurrentFile);
reloadButton?.addEventListener("click", () => currentFile && loadFile(currentFile.path));
resetButton?.addEventListener("click", () => {
  if (!currentFile) return;
  editor.value = currentFile.headContent;
  setState("HEAD im Editor · noch nicht gespeichert");
});

gitVerifyButton?.addEventListener("click", verifyGitCandidate);
gitPublishButton?.addEventListener("click", publishGitCandidate);

editor?.addEventListener("input", () => {
  if (!currentFile) return;
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

document.querySelectorAll("[data-studio-open]").forEach((button) => {
  button.addEventListener("click", async () => {
    if (!studioAvailable) return;
    const path = button.dataset.studioOpen;
    if (path) await loadFile(path);
    UIkit.offcanvas(studioElement)?.show();
  });
});

await loadStatus();
