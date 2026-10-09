import { execFileSync } from "node:child_process";
import { kalkuramaSource } from "../src/kalkurama-source.js";
import { transferState } from "../src/transfer-state.js";

const transferableExact = new Set([
  "index.html",
  "overview.html",
  "project.html",
  "estimates.html",
  "estimate.html",
  "estimate-share.html",
  "invoices.html",
  "invoice.html",
  "invoice-share.html",
  "payments.html",
  "credit-notes.html",
  "services.html",
  "work.html",
  "work-correction-fixed.html",
  "work-correction-quantity.html",
  "work-correction-expense.html",
  "time.html",
  "settings.html",
  "src/app.js"
]);

const transferablePrefixes = [
  "partials/",
  "src/styles/",
  "src/themes/"
];

const prototypeOnlyExact = new Set([
  "styleguide.html",
  "partials/studio.html",
  "src/studio.js",
  "src/styles/prototype.less",
  "src/styles/product.less",
  "src/styles/shell.less",
  "src/styles/system.less",
  "src/themes/standard-reset.less"
]);

const prototypeOnlyPrefixes = [
  "partials/styleguide/"
];

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function changedFiles(from, to) {
  const output = git(["diff", "--name-only", from + ".." + to]);
  return output ? output.split("\n").filter(Boolean) : [];
}

function isTransferable(path) {
  if (prototypeOnlyExact.has(path) || prototypeOnlyPrefixes.some((prefix) => path.startsWith(prefix))) {
    return false;
  }

  return transferableExact.has(path) || transferablePrefixes.some((prefix) => path.startsWith(prefix));
}

const current = git(["rev-parse", "HEAD"]);
const checkpoint = transferState.lastPromotion?.clickdummyCommit ?? transferState.uiBaselineClickdummyCommit;

try {
  git(["merge-base", "--is-ancestor", checkpoint, current]);
} catch {
  throw new Error("Configured clickdummy transfer checkpoint is not an ancestor of HEAD.");
}

const files = changedFiles(checkpoint, current);
const uiFiles = files.filter(isTransferable);
const nonUiFiles = files.filter((path) => !isTransferable(path));

console.log("Kalkurama clickdummy transfer status");
console.log("------------------------------------");
console.log("Kalkurama source baseline: " + kalkuramaSource.commit);
console.log("Clickdummy checkpoint:     " + checkpoint);
console.log("Clickdummy HEAD:           " + current);
console.log("");

if (uiFiles.length === 0) {
  console.log("No pending transferable UI changes.");
} else {
  console.log("Pending transferable UI changes:");
  for (const path of uiFiles) console.log("  - " + path);
}

if (nonUiFiles.length > 0) {
  console.log("");
  console.log("Changed files not auto-classified for Kalkurama transfer:");
  for (const path of nonUiFiles) console.log("  - " + path);
}

console.log("");
console.log("Mock content, styleguide, Kalkurama Studio, metadata and documentation are never promoted blindly.");
