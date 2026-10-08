import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import less from "less";
import { kalkuramaSource } from "../src/kalkurama-source.js";
import { transferState } from "../src/transfer-state.js";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const fullSha = /^[0-9a-f]{40}$/;

const productPages = [
  ["index.html", "workspace"],
  ["overview.html", "overview"],
  ["project.html", "project"],
  ["estimates.html", "estimates"],
  ["estimate.html", "estimates"],
  ["invoices.html", "invoices"],
  ["invoice.html", "invoices"],
  ["payments.html", "payments"],
  ["credit-notes.html", "credit-notes"],
  ["services.html", "services"],
  ["work.html", "work"],
  ["work-correction-fixed.html", "work"],
  ["work-correction-quantity.html", "work"],
  ["work-correction-expense.html", "work"],
  ["time.html", "time"],
  ["settings.html", "settings"]
];
const allPages = [...productPages, ["styleguide.html", "styleguide"]];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const appSource = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
const studioSource = await readFile(new URL("../src/studio.js", import.meta.url), "utf8");
const standardTheme = await readFile(new URL("../src/themes/standard.less", import.meta.url), "utf8");
const kalkuramaTheme = await readFile(new URL("../src/themes/kalkurama.less", import.meta.url), "utf8");
const kalkuramaImports = await readFile(new URL("../src/themes/kalkurama/_import.less", import.meta.url), "utf8");
const offcanvasTheme = await readFile(new URL("../src/themes/kalkurama/offcanvas.less", import.meta.url), "utf8");
const shellLess = await readFile(new URL("../src/styles/shell.less", import.meta.url), "utf8");
const productLess = await readFile(new URL("../src/styles/product.less", import.meta.url), "utf8");
const prototypeLess = await readFile(new URL("../src/styles/prototype.less", import.meta.url), "utf8");
const viteConfig = await readFile(new URL("../vite.config.js", import.meta.url), "utf8");
const transferStatus = await readFile(new URL("./transfer-status.mjs", import.meta.url), "utf8");
const productSourceGuide = await readFile(new URL("../docs/PRODUCT-SOURCE.md", import.meta.url), "utf8");
const themesGuide = await readFile(new URL("../docs/THEMES.md", import.meta.url), "utf8");
const styleguideGuide = await readFile(new URL("../docs/STYLEGUIDE.md", import.meta.url), "utf8");
const themeStudioGuide = await readFile(new URL("../docs/STUDIO.md", import.meta.url), "utf8");
const transferGuide = await readFile(new URL("../docs/UI-TRANSFER.md", import.meta.url), "utf8");
const branchWorkflow = await readFile(new URL("../.github/workflows/branch-verify.yml", import.meta.url), "utf8");
const pagesWorkflow = await readFile(new URL("../.github/workflows/pages-preview.yml", import.meta.url), "utf8");
const styleguideExampleFiles = await readdir(new URL("../partials/styleguide/", import.meta.url));
const themeEntries = await readdir(new URL("../src/themes/", import.meta.url));
const customerEditModal = await readFile(new URL("../partials/customer-edit-modal.html", import.meta.url), "utf8");
const projectEditModal = await readFile(new URL("../partials/project-edit-modal.html", import.meta.url), "utf8");
const workCorrectionAudit = await readFile(new URL("../partials/work-correction-audit.html", import.meta.url), "utf8");
const sidebarPartial = await readFile(new URL("../partials/sidebar.html", import.meta.url), "utf8");
const sidebarInnerPartial = await readFile(new URL("../partials/sidebar-inner.html", import.meta.url), "utf8");
const studioPartial = await readFile(new URL("../partials/studio.html", import.meta.url), "utf8");
const sharedPartials = [
  await readFile(new URL("../partials/header.html", import.meta.url), "utf8"),
  await readFile(new URL("../partials/sidebar.html", import.meta.url), "utf8"),
  await readFile(new URL("../partials/sidebar-inner.html", import.meta.url), "utf8"),
  await readFile(new URL("../partials/sidebar-content.html", import.meta.url), "utf8"),
  await readFile(new URL("../partials/mobile-sidebar.html", import.meta.url), "utf8"),
  await readFile(new URL("../partials/studio.html", import.meta.url), "utf8")
].join("\n");

assert(kalkuramaSource.repository === "cemfirat/kalkurama", "Product source repository must stay explicit.");
assert(kalkuramaSource.commit === "2bd658c65020984fe2583161ae8cceeae583f618", "Unexpected Kalkurama source baseline.");
assert(fullSha.test(transferState.uiBaselineClickdummyCommit), "Clickdummy baseline must be a full SHA.");
assert(packageJson.dependencies?.uikit === "3.25.25", "Clickdummy must match productive UIkit 3.25.25.");
assert(packageJson.scripts?.dev === "vite --mode kalkurama", "Kalkurama must be the default dev theme.");
assert(packageJson.scripts?.build === "vite build --mode kalkurama", "Kalkurama must be the default build theme.");
assert(packageJson.scripts?.studio === "vite --mode kalkurama --host 127.0.0.1", "Kalkurama Studio must bind to loopback.");

const html = {};
for (const [page, pageId] of allPages) {
  html[page] = await readFile(new URL("../" + page, import.meta.url), "utf8");
  assert(html[page].includes('<body data-page="' + pageId + '"'), page + " must expose its page id.");
  assert(html[page].includes("<!-- @include partials/header.html -->"), page + " must use the shared header.");
  assert(html[page].includes("<!-- @include partials/sidebar.html -->"), page + " must use the shared desktop sidebar.");
  assert(html[page].includes("<!-- @include partials/mobile-sidebar.html -->"), page + " must use the shared mobile sidebar.");
  assert(html[page].includes('<script type="module" src="/src/app.js"></script>'), page + " must load behavior-only app.js.");
}

assert(html["index.html"].includes('data-project="website-relaunch"'), "Daily landing must expose the selected Website Relaunch project.");
assert(html["project.html"].includes('data-project="brand-refresh"'), "Project page must expose the selected Brand Refresh project.");
assert(sharedPartials.includes('data-project-context="website-relaunch"'), "Sidebar must expose Website Relaunch project metadata.");
assert(sharedPartials.includes('data-project-context="brand-refresh"'), "Sidebar must expose Brand Refresh project metadata.");
assert(appSource.includes("document.body.dataset.project"), "Product app.js must activate project context from body metadata.");
assert(appSource.includes("[data-project-context]"), "Product app.js must target semantic project links.");

assert(html["index.html"].includes("kalkurama-customer-workspace"), "Daily landing must be customer/project-first.");
assert(html["index.html"].includes("kalkurama-project-list"), "Daily landing must keep the project list visible.");
assert(html["index.html"].includes("kalkurama-running-timer"), "Daily landing must keep timer state in project context.");
assert(html["index.html"].includes("uk-subnav uk-subnav-pill"), "Customer workspace must expose project-scoped document tabs.");
assert(html["project.html"].includes("Unverrechnete Arbeit"), "Project view must keep work as a central surface.");

assert(sidebarPartial.includes("@include partials/customer-edit-modal.html"), "Shared sidebar must include the selected Customer editor.");
assert(sidebarInnerPartial.includes('href="#customer-edit-modal"'), "Selected-Customer sidebar settings must open the Customer editor.");
assert(sidebarInnerPartial.includes('aria-label="Kunde bearbeiten"'), "Selected-Customer settings action must remain explicit.");
assert(html["index.html"].includes('data-uk-toggle="target: #customer-edit-modal"'), "Customer workspace edit action must open the shared Customer editor.");

for (const field of [
  'id="customer-name"',
  'id="customer-email"',
  'id="customer-billing-address"',
  'id="customer-tax-id"',
  'id="customer-payment-terms"',
  'id="customer-default-currency"',
  'id="customer-notes"'
]) {
  assert(customerEditModal.includes(field), "Customer editor is missing productive #81 field: " + field);
}
assert(customerEditModal.includes('min="0" max="3650"'), "Customer payment terms must preserve productive range.");
assert(customerEditModal.includes("Workspace-Standard EUR"), "Customer default currency must document Workspace fallback.");
assert(customerEditModal.includes("nur für neu angelegte kommerzielle Datensätze"), "Customer currency helper must preserve new-record-only semantics.");
assert(customerEditModal.includes("bestehende kommerzielle Dokumente bleiben unverändert"), "Customer notes must preserve historical-document semantics.");

assert(html["index.html"].includes("Lifecycle · Website Relaunch · Aktiv"), "Selected Project must expose compact lifecycle context.");
for (const transition of ["Auf Pausiert setzen", "Auf Abgeschlossen setzen", "Auf Archiviert setzen"]) {
  assert(html["index.html"].includes(transition), "Customer workspace is missing active Project transition: " + transition);
  assert(html["project.html"].includes(transition), "Project detail is missing active Project transition: " + transition);
}
assert(html["project.html"].includes("Nur aktive Projekte akzeptieren neue Timer und manuell erfasste Arbeit."), "Project lifecycle must explain the Active-only Work rule.");
for (const action of ["Zeit hinzufügen", "Fix hinzufügen", "Menge hinzufügen", "Auslage hinzufügen"]) {
  assert(html["project.html"].includes(action), "Active Project detail is missing productive Work action: " + action);
}
assert(html["project.html"].includes('data-uk-toggle="target: #project-edit-modal"'), "Project detail must expose Project rename.");
assert(html["project.html"].includes("@include partials/project-edit-modal.html"), "Project detail must include the Project editor.");
assert(projectEditModal.includes('id="project-name"'), "Project editor must expose Project name.");
assert(projectEditModal.includes("ändert nur die aktuelle Projektbezeichnung"), "Project rename must preserve live-label semantics.");
assert(projectEditModal.includes("Dokument-Snapshots") && projectEditModal.includes("Historie bleiben unverändert"), "Project editor must preserve issued-history semantics.");

assert(html["work.html"].includes('href="./work-correction-fixed.html"'), "Work list must expose Fixed correction.");
assert(html["work.html"].includes('href="./work-correction-quantity.html"'), "Work list must expose Quantity correction.");
assert(html["work.html"].includes('href="./work-correction-expense.html"'), "Work list must expose Expense correction.");
assert(html["work.html"].includes("data-work-correction-history"), "Work list must expose correction audit history.");
assert(html["work.html"].includes("Vorher") && html["work.html"].includes("Nachher"), "Correction history must show before/after values.");

for (const page of [
  "work-correction-fixed.html",
  "work-correction-quantity.html",
  "work-correction-expense.html"
]) {
  assert(html[page].includes("Korrekturgrund"), page + " must require an explicit correction reason.");
  assert(html[page].includes("unverrechnet"), page + " must state that direct correction is limited to unbilled work.");
  assert(html[page].includes("Original"), page + " must expose the original commercial values.");
  assert(
    html[page].includes("@include partials/work-correction-audit.html"),
    page + " must include the shared correction audit semantics."
  );
  assert(
    html[page].includes("reserviert") || html[page].includes("Entwurfsrechnung"),
    page + " must explain the selected_for_draft_invoice correction boundary."
  );
  assert(
    html[page].includes("verrechnet") && html[page].includes("nicht verrechenbar"),
    page + " must explain terminal billing-state correction boundaries."
  );
}

assert(workCorrectionAudit.includes("Bearbeiter"), "Correction audit must expose the actor.");
assert(workCorrectionAudit.includes("Serverzeit"), "Correction audit must expose save-time semantics.");
assert(workCorrectionAudit.includes("Pflichtfeld aus der Korrektur"), "Correction audit must preserve the required reason.");
assert(workCorrectionAudit.includes("Originalwerte"), "Correction audit must preserve original commercial values.");
assert(workCorrectionAudit.includes("append-only"), "Correction audit history must remain append-only.");

assert(html["work-correction-fixed.html"].includes('name="entry_type" value="fixed"'), "Fixed correction type must remain explicit.");
assert(html["work-correction-fixed.html"].includes("Betrag"), "Fixed correction must expose amount.");
assert(html["work-correction-quantity.html"].includes('name="entry_type" value="quantity"'), "Quantity correction type must remain explicit.");
assert(html["work-correction-quantity.html"].includes("Menge") && html["work-correction-quantity.html"].includes("Einzelpreis"), "Quantity correction must expose quantity and unit price.");
assert(html["work-correction-expense.html"].includes('name="entry_type" value="expense"'), "Expense correction type must remain explicit.");
assert(html["work-correction-expense.html"].includes("Betrag"), "Expense correction must expose amount.");

assert(html["invoices.html"].includes('href="./invoice.html"'), "Invoice list must link to the discount prototype.");
assert(html["invoice.html"].includes("Vor Rabatt"), "Invoice detail must expose the pre-discount amount.");
assert(html["invoice.html"].includes("Rabatt %"), "Invoice detail must expose explicit discount-rate editing.");
assert(html["invoice.html"].includes("−130,00 EUR"), "Invoice detail must expose explicit discount amount.");
assert(html["invoice.html"].includes('data-source-work="time:1842"'), "Invoice detail must preserve source Work traceability.");
assert(html["invoice.html"].includes("selected_for_draft_invoice"), "Invoice detail must preserve draft work-reservation semantics.");
assert(html["invoice.html"].includes("Discount Rate/Amount"), "Invoice detail must state issued discount snapshot semantics.");
assert(html["invoice.html"].includes("HTML, PDF, E-Mail, E-Invoice"), "Invoice detail must preserve HTML/PDF/email/e-invoice presentation consistency.");
assert(html["credit-notes.html"].includes("data-credit-note-snapshot"), "Credit Notes must expose issued Invoice snapshot semantics.");
assert(html["credit-notes.html"].includes("Rabatt Rate/Amount"), "Credit Notes must preserve the Invoice discount snapshot.");
assert(html["credit-notes.html"].includes("nicht aus später veränderten Work-Daten neu berechnet"), "Credit Notes must not recalculate discounts from later Work state.");

assert(html["estimates.html"].includes('href="./estimate.html"'), "Estimate list must link to the section prototype.");
assert(html["estimate.html"].includes('data-estimate-section="concept"'), "Estimate detail must expose an explicit first section.");
assert(html["estimate.html"].includes('data-estimate-section="implementation"'), "Estimate detail must expose ordered multiple sections.");
assert(html["estimate.html"].includes("Section nach oben") && html["estimate.html"].includes("Section nach unten"), "Estimate sections must expose explicit ordering controls.");
assert(html["estimate.html"].includes("data-estimate-ungrouped"), "Estimate sections must remain optional by supporting ungrouped items.");
assert(html["estimate.html"].includes("Sections sind optional"), "Estimate detail must state that sections are optional.");
assert(html["estimate.html"].includes("historischen Snapshot"), "Estimate detail must preserve section ordering in the issued snapshot.");
assert(html["estimate.html"].includes("data-estimate-issued-snapshot"), "Estimate detail must expose issued Section snapshot semantics.");
assert(html["estimate.html"].includes("HTML, PDF und E-Mail"), "Estimate Section presentation must remain consistent across output channels.");
assert(html["estimate.html"].includes("Frühere ausgestellte Revisionen bleiben unverändert"), "Estimate revisions must preserve previous issued snapshots.");

for (const marker of [
  "uk-card uk-card-default",
  "uk-table uk-table-divider",
  "uk-form-stacked",
  "uk-subnav uk-subnav-pill",
  "uk-label",
  "uk-offcanvas"
]) {
  assert((Object.values(html).join("\n") + "\n" + sharedPartials).includes(marker), "Expected UIkit marker missing: " + marker);
}

assert(!/\bfetch\s*\(/.test(appSource), "Product app.js must not call remote APIs.");
assert(!/XMLHttpRequest/.test(appSource), "Product app.js must not use XMLHttpRequest.");
assert(!/\.innerHTML\s*=/.test(appSource), "Product app.js must not render page markup.");
assert(!/insertAdjacentHTML/.test(appSource), "Product app.js must not inject structural markup.");
assert(!/<(?:main|section|article|table|nav|aside)\b/i.test(appSource), "Product app.js must not contain page markup.");
assert(appSource.includes('import "@kalkurama-theme";'), "Product app.js must load the selected theme.");
assert(appSource.includes("document.documentElement.dataset.theme = __KALKURAMA_THEME__"), "Active theme must be inspectable.");

assert(themeEntries.includes("standard.less"), "UIkit Standard theme entry missing.");
assert(themeEntries.includes("kalkurama.less"), "Kalkurama theme entry missing.");
assert(themeEntries.includes("kalkurama"), "Kalkurama theme folder missing.");
assert(themeEntries.includes("customers"), "Customer theme folder missing.");
assert(standardTheme.includes('@import "uikit/src/less/uikit.theme.less";'), "Standard theme must import UIkit default theme.");
assert(!standardTheme.includes('@import "uikit/src/less/uikit.less";'), "Do not use core-only UIkit as the Standard theme.");
assert(kalkuramaTheme.includes('@import "standard.less";'), "Kalkurama theme must inherit Standard.");
assert(kalkuramaTheme.includes('@import "kalkurama/_import.less";'), "Kalkurama theme must load component customizations.");
assert(kalkuramaImports.includes('@import "variables.less";'), "Kalkurama theme variables import missing.");
assert(kalkuramaImports.includes('@import "offcanvas.less";'), "Kalkurama Offcanvas theme import missing.");
assert(offcanvasTheme.includes("@offcanvas-bar-background"), "Light customer drawer must use UIkit Offcanvas variable.");
assert(offcanvasTheme.includes(".hook-offcanvas-bar()"), "Offcanvas custom declaration must use UIkit hook.");

const nonThemeLess = [shellLess, productLess, prototypeLess].join("\n");
for (const selector of [".uk-button", ".uk-input", ".uk-select", ".uk-textarea", ".uk-card", ".uk-label", ".uk-badge", ".uk-alert"]) {
  assert(!nonThemeLess.includes(selector), "Standard UIkit component must not be reskinned outside theme layer: " + selector);
}

assert(viteConfig.includes('name: "kalkurama-html-partials"'), "HTML partial plugin missing.");
assert(viteConfig.includes('name: "kalkurama-studio"'), "Kalkurama Studio plugin missing.");
assert(viteConfig.includes('apply: "serve"'), "Kalkurama Studio must be dev-server only.");
assert(viteConfig.includes('address === "127.0.0.1" || address === "::1"'), "Kalkurama Studio must enforce loopback.");
assert(viteConfig.includes('const files = ["src/themes/kalkurama.less"]'), "Kalkurama Studio allowlist must start at Kalkurama.");
assert(viteConfig.includes("function listMarkupStudioFiles()"), "Kalkurama Studio must expose a markup allowlist.");
assert(viteConfig.includes("Object.values(htmlEntries)"), "Markup allowlist must start from known HTML entry points.");
assert(viteConfig.includes('relativePath === "partials/studio.html"'), "Studio UI partial must remain outside the editable markup allowlist.");
assert(viteConfig.includes("function validateMarkupSources()"), "Markup saves must validate all HTML entry points.");
assert(viteConfig.includes("expandHtmlPartials(expandCodePartials(source))"), "Markup validation must expand shared includes and code examples.");
assert(viteConfig.includes('type === "theme"'), "Studio save flow must distinguish Theme from Markup.");
assert(viteConfig.includes('validated: type === "markup" ? ["markup"] : []'), "Markup save response must report validation.");
assert(!viteConfig.includes('const files = ["src/themes/standard.less"]'), "UIkit Standard must remain read-only.");
assert(viteConfig.includes("await less.render"), "Kalkurama Studio must compile LESS before accepting saves.");
assert(viteConfig.includes("rolledBack: true"), "Kalkurama Studio must report rollback after compile failure.");
assert(viteConfig.includes('requestUrl.pathname === "/__studio/git/verify"'), "Kalkurama Studio Git verify endpoint missing.");
assert(viteConfig.includes('requestUrl.pathname === "/__studio/git/publish"'), "Kalkurama Studio Git publish endpoint missing.");
assert(viteConfig.includes('runNpmScript("verify")'), "Git Sync must run local full verification.");
assert(viteConfig.includes('return "studio/ui-" + stamp'), "Git Sync must create studio/* working branches.");
assert(viteConfig.includes('const verifyBranch = "verify/studio-ui-" + shortSha'), "Git Sync must create an exact verify/** branch.");
assert(viteConfig.includes("Git Sync requires origin to be cemfirat/kalkurama-clickdummy."), "Git Sync must pin the exact repository origin.");
assert(viteConfig.includes("Local main is not synchronized with origin/main."), "Git Sync must verify current origin/main.");
assert(viteConfig.includes("Git user.name and user.email must be configured"), "Git Sync must validate Git identity before staging.");
assert(viteConfig.includes("Git Sync found staged changes"), "Git Sync must reject pre-existing staged changes.");
assert(viteConfig.includes("Git Sync found a non-Studio change"), "Git Sync must reject unrelated working-tree changes.");
assert(viteConfig.includes("Commit message must contain 5–120 characters on one line."), "Git Sync must validate commit messages.");
assert(viteConfig.includes('GIT_TERMINAL_PROMPT: "0"'), "Remote Git commands must not prompt inside Vite.");
assert(viteConfig.includes('gitRaw(["add", "--", ...paths])'), "Git Sync must stage only explicit Kalkurama Studio paths.");
assert(viteConfig.includes('gitRawOptional(["reset", "--", ...paths])'), "Git Sync must unstage controlled paths after commit/staging failure.");
assert(!viteConfig.includes('shell: true'), "Kalkurama Studio must never enable shell command execution.");
assert(!viteConfig.includes('/__studio/git/pr'), "Kalkurama Studio must not expose a PR creation endpoint.");
assert(!viteConfig.includes('pushGitRef(["-u", "origin", "main"'), "Kalkurama Studio must never push directly to main.");
assert(viteConfig.includes('mode === "pages" ? "/kalkurama-clickdummy/" : "/"'), "Pages base path must be explicit.");
assert(viteConfig.includes('invoice: "invoice.html"'), "Vite multi-page build must include invoice.html.");
assert(viteConfig.includes('estimate: "estimate.html"'), "Vite multi-page build must include estimate.html.");
assert(viteConfig.includes('workCorrectionFixed: "work-correction-fixed.html"'), "Vite build must include Fixed correction page.");
assert(viteConfig.includes('workCorrectionQuantity: "work-correction-quantity.html"'), "Vite build must include Quantity correction page.");
assert(viteConfig.includes('workCorrectionExpense: "work-correction-expense.html"'), "Vite build must include Expense correction page.");
assert(/\bstandard:\s*"src\/themes\/standard\.less"/.test(viteConfig), "Standard Vite mode missing.");
assert(/\bkalkurama:\s*"src\/themes\/kalkurama\.less"/.test(viteConfig), "Kalkurama Vite mode missing.");
assert(/\bpages:\s*"src\/themes\/kalkurama\.less"/.test(viteConfig), "Pages must compile the Kalkurama theme.");
assert(viteConfig.includes("includeCodePattern") && viteConfig.includes("expandCodePartials"), "Styleguide code include support missing.");

for (const example of [
  "typography.html",
  "layout.html",
  "buttons.html",
  "cards.html",
  "forms.html",
  "tables.html",
  "navigation.html",
  "status.html",
  "feedback.html",
  "kalkurama.html",
  "estimate-sections.html",
  "invoice-discount.html"
]) {
  assert(styleguideExampleFiles.includes(example), "Missing Styleguide example: " + example);
}
for (const section of [
  'id="theme"',
  'id="tokens"',
  'id="typography"',
  'id="layout"',
  'id="buttons"',
  'id="cards"',
  'id="forms"',
  'id="tables"',
  'id="navigation"',
  'id="status"',
  'id="feedback"',
  'id="kalkurama-project-work"',
  'id="kalkurama-estimate-sections"',
  'id="kalkurama-invoice-discounts"',
  'id="kalkurama-work-corrections"'
]) {
  assert(html["styleguide.html"].includes(section), "Missing Styleguide section: " + section);
}

assert(html["styleguide.html"].includes("@include-code partials/styleguide/"), "Styleguide must expose Markup from the same example source.");
assert(html["styleguide.html"].includes("@include-code partials/work-correction-audit.html"), "Styleguide must reuse the real Work correction audit partial for Markup.");
assert(html["styleguide.html"].includes("Estimate Sections"), "Styleguide must document Estimate Sections.");
assert(html["styleguide.html"].includes("Invoice Line Discounts"), "Styleguide must document Invoice Line Discounts.");
assert(html["styleguide.html"].includes("Audited Work Corrections"), "Styleguide must document audited Work corrections.");
assert(html["styleguide.html"].includes("styleguide-example-tabs"), "Styleguide must use consistent Preview/Markup tabs.");
assert(html["styleguide.html"].includes("data-studio-open"), "Styleguide must expose local Kalkurama Studio entry points.");
assert(html["styleguide.html"].includes("@include partials/studio.html"), "Styleguide must include Kalkurama Studio.");
assert(studioSource.includes('file.type === "markup" ? "Markup" : "Theme"'), "Studio client must expose the active file type.");
assert(html["styleguide.html"].includes('src="/src/studio.js"'), "Styleguide must load Kalkurama Studio client.");
assert(studioSource.includes('const endpoint = "/__studio"'), "Kalkurama Studio client must use only local Studio endpoints.");
assert(!studioSource.includes("api.github.com"), "Kalkurama Studio client must not talk to GitHub directly.");
assert(studioSource.includes('api("/git/verify"'), "Kalkurama Studio client must expose local verification.");
assert(studioSource.includes('api("/git/publish"'), "Kalkurama Studio client must expose controlled publish.");
assert(studioSource.includes("Ungespeicherte LESS-Änderungen vorhanden"), "Git Sync must block unsaved editor changes.");
assert(studioPartial.includes("data-studio-commit-message"), "Kalkurama Studio Git Sync commit field missing.");
assert(studioPartial.includes("data-studio-git-verify"), "Kalkurama Studio local verification control missing.");
assert(studioPartial.includes("data-studio-git-publish"), "Kalkurama Studio controlled publish control missing.");
assert(studioPartial.includes("Das Studio erstellt keinen Pull Request"), "Kalkurama Studio must state that it does not create PRs.");
assert(studioPartial.includes("Pull Request erst nach grüner Branch-CI"), "Kalkurama Studio must expose the CI-before-PR rule.");

assert(productSourceGuide.includes("Billings-like daily interaction architecture"), "Product source guide must preserve UX target.");
assert(productSourceGuide.includes("3.25.25"), "Product source guide must record productive UIkit version.");
assert(productSourceGuide.includes("#85 — explicit Invoice line discounts"), "Product source guide must document Invoice discount issue #85.");
assert(productSourceGuide.includes("pre-discount amount"), "Product source guide must preserve explicit pre-discount semantics.");
assert(productSourceGuide.includes("#84 — explicit Estimate sections"), "Product source guide must document Estimate Sections issue #84.");
assert(productSourceGuide.includes("sections are optional"), "Product source guide must preserve optional Estimate section semantics.");
assert(productSourceGuide.includes("#81 — customer commercial baseline and context view"), "Product source guide must document productive Customer baseline #81.");
assert(productSourceGuide.includes("optional default currency with Workspace fallback"), "Product source guide must preserve Customer currency fallback.");
assert(productSourceGuide.includes("internal notes"), "Product source guide must preserve Customer notes baseline.");
assert(productSourceGuide.includes("#82 — project lifecycle and contextual project view"), "Product source guide must document productive Project baseline #82.");
assert(productSourceGuide.includes("Active → Paused / Completed / Archived"), "Product source guide must preserve Active Project transitions.");
assert(productSourceGuide.includes("Only Active projects accept new timers and manual Work"), "Product source guide must preserve Active-only Work semantics.");
assert(productSourceGuide.includes("#86 — audited corrections for fixed, quantity and expense work"), "Product source guide must document Work correction issue #86.");
assert(productSourceGuide.includes("selected_for_draft_invoice"), "Product source guide must preserve the draft-reservation correction boundary.");
assert(productSourceGuide.includes("original and corrected commercial values"), "Product source guide must preserve before/after audit semantics.");
assert(themesGuide.includes("UIkit Standard") && themesGuide.includes("Kalkurama"), "Theme guide must document hierarchy.");
assert(styleguideGuide.includes("Preview") && styleguideGuide.includes("Markup"), "Styleguide guide must document Preview/Markup.");
assert(styleguideGuide.includes("Single source for Preview + Markup"), "Styleguide guide must document synchronized example sources.");
assert(styleguideGuide.includes("Product emphasis"), "Styleguide guide must explain Kalkurama-specific documentation priorities.");
assert(styleguideGuide.includes("Kalkurama product patterns"), "Styleguide guide must document the v1 product-pattern split.");
assert(styleguideGuide.includes("partials/work-correction-audit.html"), "Styleguide guide must document reuse of the real Work correction audit partial.");
assert(styleguideGuide.includes("UIkit-first rule"), "Styleguide guide must preserve the UIkit-first rule.");
assert(themeStudioGuide.includes("No PR before green branch CI"), "Kalkurama Studio guide must preserve CI rule.");
assert(transferGuide.includes("No PR before green branch CI"), "Transfer guide must preserve CI rule.");

assert(transferStatus.includes('"partials/studio.html"'), "Kalkurama Studio must remain prototype-only for transfer.");
assert(transferStatus.includes('"partials/styleguide/"'), "Styleguide examples must remain prototype-only for transfer.");
assert(transferStatus.includes('"src/themes/"'), "Theme changes must be classified for transfer.");
assert(transferStatus.includes('"invoice.html"'), "Invoice detail must be classified for transfer.");
assert(transferStatus.includes('"estimate.html"'), "Estimate detail must be classified for transfer.");
assert(transferStatus.includes('"work-correction-fixed.html"'), "Fixed correction page must be classified for transfer.");
assert(transferStatus.includes('"work-correction-quantity.html"'), "Quantity correction page must be classified for transfer.");
assert(transferStatus.includes('"work-correction-expense.html"'), "Expense correction page must be classified for transfer.");

assert(branchWorkflow.includes('"verify/**"'), "Branch verify workflow must target verify/**.");
assert(branchWorkflow.includes("npm run verify"), "Branch verify workflow must run full verification.");
assert(!/^\s*push:/m.test(pagesWorkflow), "Pages workflow must remain manual until Pages is enabled.");
assert(pagesWorkflow.includes("workflow_dispatch:"), "Pages workflow must be manually runnable.");

const themeFilename = resolve(rootDirectory, "src/themes/kalkurama.less");
await less.render(await readFile(themeFilename, "utf8"), {
  filename: themeFilename,
  javascriptEnabled: false,
  paths: [rootDirectory, resolve(rootDirectory, "node_modules")]
});

console.log("Kalkurama clickdummy foundation checks passed.");
