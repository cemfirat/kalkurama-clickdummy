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
  ["payments.html", "payments"],
  ["credit-notes.html", "credit-notes"],
  ["services.html", "services"],
  ["work.html", "work"],
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
const themeStudioGuide = await readFile(new URL("../docs/THEME-STUDIO.md", import.meta.url), "utf8");
const transferGuide = await readFile(new URL("../docs/UI-TRANSFER.md", import.meta.url), "utf8");
const branchWorkflow = await readFile(new URL("../.github/workflows/branch-verify.yml", import.meta.url), "utf8");
const pagesWorkflow = await readFile(new URL("../.github/workflows/pages-preview.yml", import.meta.url), "utf8");
const styleguideExampleFiles = await readdir(new URL("../partials/styleguide/", import.meta.url));
const themeEntries = await readdir(new URL("../src/themes/", import.meta.url));
const sharedPartials = [
  await readFile(new URL("../partials/header.html", import.meta.url), "utf8"),
  await readFile(new URL("../partials/sidebar.html", import.meta.url), "utf8"),
  await readFile(new URL("../partials/sidebar-inner.html", import.meta.url), "utf8"),
  await readFile(new URL("../partials/sidebar-content.html", import.meta.url), "utf8"),
  await readFile(new URL("../partials/mobile-sidebar.html", import.meta.url), "utf8"),
  await readFile(new URL("../partials/theme-studio.html", import.meta.url), "utf8")
].join("\n");

assert(kalkuramaSource.repository === "cemfirat/kalkurama", "Product source repository must stay explicit.");
assert(kalkuramaSource.commit === "2bd658c65020984fe2583161ae8cceeae583f618", "Unexpected Kalkurama source baseline.");
assert(fullSha.test(transferState.uiBaselineClickdummyCommit), "Clickdummy baseline must be a full SHA.");
assert(packageJson.dependencies?.uikit === "3.25.25", "Clickdummy must match productive UIkit 3.25.25.");
assert(packageJson.scripts?.dev === "vite --mode kalkurama", "Kalkurama must be the default dev theme.");
assert(packageJson.scripts?.build === "vite build --mode kalkurama", "Kalkurama must be the default build theme.");
assert(packageJson.scripts?.studio === "vite --mode kalkurama --host 127.0.0.1", "Theme Studio must bind to loopback.");

const html = {};
for (const [page, pageId] of allPages) {
  html[page] = await readFile(new URL("../" + page, import.meta.url), "utf8");
  assert(html[page].includes('<body data-page="' + pageId + '">'), page + " must expose its page id.");
  assert(html[page].includes("<!-- @include partials/header.html -->"), page + " must use the shared header.");
  assert(html[page].includes("<!-- @include partials/sidebar.html -->"), page + " must use the shared desktop sidebar.");
  assert(html[page].includes("<!-- @include partials/mobile-sidebar.html -->"), page + " must use the shared mobile sidebar.");
  assert(html[page].includes('<script type="module" src="/src/app.js"></script>'), page + " must load behavior-only app.js.");
}

assert(html["index.html"].includes("kalkurama-customer-workspace"), "Daily landing must be customer/project-first.");
assert(html["index.html"].includes("kalkurama-project-list"), "Daily landing must keep the project list visible.");
assert(html["index.html"].includes("kalkurama-running-timer"), "Daily landing must keep timer state in project context.");
assert(html["index.html"].includes("uk-subnav uk-subnav-pill"), "Customer workspace must expose project-scoped document tabs.");
assert(html["project.html"].includes("Unverrechnete Arbeit"), "Project view must keep work as a central surface.");

assert(html["estimates.html"].includes('href="./estimate.html"'), "Estimate list must link to the section prototype.");
assert(html["estimate.html"].includes('data-estimate-section="concept"'), "Estimate detail must expose an explicit first section.");
assert(html["estimate.html"].includes('data-estimate-section="implementation"'), "Estimate detail must expose ordered multiple sections.");
assert(html["estimate.html"].includes("Section nach oben") && html["estimate.html"].includes("Section nach unten"), "Estimate sections must expose explicit ordering controls.");
assert(html["estimate.html"].includes("data-estimate-ungrouped"), "Estimate sections must remain optional by supporting ungrouped items.");
assert(html["estimate.html"].includes("Sections sind optional"), "Estimate detail must state that sections are optional.");
assert(html["estimate.html"].includes("historischen Snapshot"), "Estimate detail must preserve section ordering in the issued snapshot.");

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
assert(viteConfig.includes('name: "kalkurama-theme-studio"'), "Theme Studio plugin missing.");
assert(viteConfig.includes('apply: "serve"'), "Theme Studio must be dev-server only.");
assert(viteConfig.includes('address === "127.0.0.1" || address === "::1"'), "Theme Studio must enforce loopback.");
assert(viteConfig.includes('const files = ["src/themes/kalkurama.less"]'), "Theme Studio allowlist must start at Kalkurama.");
assert(!viteConfig.includes('const files = ["src/themes/standard.less"]'), "UIkit Standard must remain read-only.");
assert(viteConfig.includes("await less.render"), "Theme Studio must compile LESS before accepting saves.");
assert(viteConfig.includes("rolledBack: true"), "Theme Studio must report rollback after compile failure.");
assert(viteConfig.includes('mode === "pages" ? "/kalkurama-clickdummy/" : "/"'), "Pages base path must be explicit.");
assert(viteConfig.includes('estimate: "estimate.html"'), "Vite multi-page build must include estimate.html.");
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
  "kalkurama.html"
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
  'id="kalkurama-components"'
]) {
  assert(html["styleguide.html"].includes(section), "Missing Styleguide section: " + section);
}

assert(html["styleguide.html"].includes("@include-code partials/styleguide/"), "Styleguide must expose Markup from the same example source.");
assert(html["styleguide.html"].includes("styleguide-example-tabs"), "Styleguide must use consistent Preview/Markup tabs.");
assert(html["styleguide.html"].includes("data-studio-open"), "Styleguide must expose local Theme Studio entry points.");
assert(html["styleguide.html"].includes("@include partials/theme-studio.html"), "Styleguide must include Theme Studio.");
assert(html["styleguide.html"].includes('src="/src/studio.js"'), "Styleguide must load Theme Studio client.");
assert(studioSource.includes('const endpoint = "/__studio"'), "Theme Studio client must use only local Studio endpoints.");
assert(!studioSource.includes("api.github.com"), "Theme Studio client must not talk to GitHub directly.");

assert(productSourceGuide.includes("Billings-like daily interaction architecture"), "Product source guide must preserve UX target.");
assert(productSourceGuide.includes("3.25.25"), "Product source guide must record productive UIkit version.");
assert(productSourceGuide.includes("#84 — explicit Estimate sections"), "Product source guide must document Estimate Sections issue #84.");
assert(productSourceGuide.includes("sections are optional"), "Product source guide must preserve optional Estimate section semantics.");
assert(themesGuide.includes("UIkit Standard") && themesGuide.includes("Kalkurama"), "Theme guide must document hierarchy.");
assert(styleguideGuide.includes("Preview") && styleguideGuide.includes("Markup"), "Styleguide guide must document Preview/Markup.");
assert(styleguideGuide.includes("Single source for Preview + Markup"), "Styleguide guide must document synchronized example sources.");
assert(styleguideGuide.includes("Product emphasis"), "Styleguide guide must explain Kalkurama-specific documentation priorities.");
assert(styleguideGuide.includes("UIkit-first rule"), "Styleguide guide must preserve the UIkit-first rule.");
assert(themeStudioGuide.includes("No PR before green branch CI"), "Theme Studio guide must preserve CI rule.");
assert(transferGuide.includes("No PR before green branch CI"), "Transfer guide must preserve CI rule.");

assert(transferStatus.includes('"partials/theme-studio.html"'), "Theme Studio must remain prototype-only for transfer.");
assert(transferStatus.includes('"partials/styleguide/"'), "Styleguide examples must remain prototype-only for transfer.");
assert(transferStatus.includes('"src/themes/"'), "Theme changes must be classified for transfer.");
assert(transferStatus.includes('"estimate.html"'), "Estimate detail must be classified for transfer.");

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
