# Product source

The productive source of truth is:

`cemfirat/kalkurama`

Inspected baseline:

`c4de7766c689484d5fc612d167d08078d9ed2607`

## Authority order

1. `docs/product/product-definition.md`
2. `docs/product/billings-like-ux.md`
3. scoped Kalkurama issues / Definition of Done
4. productive Twig/UI implementation where consistent with 1–3
5. clickdummy experiments.

The clickdummy is not a second product specification.

## Mirror contract

For product-facing UI, the clickdummy is a **static mirror** of the recorded productive Kalkurama baseline.

It must mirror:

- shared shell/header/sidebar/offcanvas structure;
- productive CSS selectors and layout behavior;
- product-surface classes and UIkit composition;
- navigation hierarchy and interaction architecture.

Only these substitutions are expected in the clickdummy:

- mock data instead of database-backed values;
- static links instead of Symfony routes;
- browser-only mock interactions instead of server actions;
- Styleguide and Kalkurama Studio tooling that never ships to production.

A product-facing clickdummy deviation is not a new product decision. Either realign it to production or record and prioritize the intended production change first.

## North Star

Kalkurama connects the complete commercial path:

```text
Customer
  → Project
    → Services / billable entries
      → Estimate
        → Work / time
          → Invoice
            → Payment
```

## UX target

The current owner decision is Billings-like daily interaction architecture:

- persistent customer context
- Project as primary work surface
- work/slips central to the project
- timer actions in project context
- estimate/invoice/payment work with minimal unrelated module hopping
- dense business-software UI
- UIkit as primary framework.

Do not copy Billings Pro branding, icons, document artwork or proprietary visual
assets.

## Inspected productive surfaces

- `templates/base.html.twig`
- `templates/shell/_sidebar.html.twig`
- `templates/customer/show.html.twig`
- `templates/project/show.html.twig`
- `templates/estimate/index.html.twig`
- `templates/estimate/show.html.twig`
- `templates/estimate/_item_rows.html.twig`
- `templates/invoice/index.html.twig`
- `templates/invoice/show.html.twig`
- `templates/work/index.html.twig`
- `templates/payment/index.html.twig`
- `templates/shell/_icon.html.twig`
- `assets/styles/app.css`
- `importmap.php`

The productive app pins UIkit `3.25.25`, which the clickdummy matches exactly.

## Productive visual identity

PR `cemfirat/kalkurama#118` is part of the recorded productive baseline.

The product mirror therefore includes:

- the Kalkurama SVG logo and SVG/ICO favicons;
- AssetMapper-equivalent theme ownership under the clickdummy Kalkurama theme;
- the productive magenta primary identity `#ff00ff` with the same hover/active steps;
- the productive UIkit primary bridge and all app-specific branded states from `assets/styles/app.css`.

The independent `standard` Vite mode is the only intentional visual exception: it normalizes the mirrored product identity back to the stock UIkit reference colors so UIkit Standard remains inspectable. The normal `kalkurama` and `pages` modes re-apply the productive identity after that reference-only normalization.

## Sync rule

Before substantial clickdummy UI work:

1. refresh current `kalkurama/main`
2. inspect relevant product docs/issues
3. compare productive Twig/CSS behavior
4. realign product-facing shell/layout/classes to the productive implementation
5. record any deliberate remaining deviation explicitly
6. update the clickdummy baseline only after the new source state is understood.

## Issue alignment

The Foundation was cross-checked against Kalkurama's scoped product issues.

### #79 — v0.1.0-alpha.3 baseline reconciliation

Issue #79 explicitly protects the existing product backbone and blocks unrelated
Class C expansion while remaining v1 gaps are reconciled.

Clickdummy consequence:

- do not invent new primary modules
- keep the complete commercial workflow visible
- use the clickdummy to improve existing v1 interaction architecture, not to
  silently expand product scope.

### #81 — customer commercial baseline and context view

Issue #81 is **Class A — productive baseline** and is already implemented in
Kalkurama.

The productive Customer editor includes:

- name;
- billing/contact email;
- billing address;
- tax/VAT identifier;
- default payment terms;
- optional default currency with Workspace fallback;
- internal notes.

Changing Customer default currency affects only newly created commercial records.
Internal notes are non-document context. Existing issued/historical records remain
unchanged.

Clickdummy consequence:

- the selected Customer remains visible in the persistent shell;
- the sidebar inspector stays limited to productive contact/address context;
- the selected-Customer settings action opens a Customer editor rather than
  generic application settings;
- Customer editing exposes payment terms, default currency and internal notes in
  a normal UIkit modal;
- currency/notes are not invented as extra sidebar metadata.

### #82 — project lifecycle and contextual project view

Issue #82 classifies Project detail/lifecycle as **Class A** and requires Project
to be a usable commercial context.

The inspected productive baseline already contains
`templates/project/show.html.twig`, Project rename and explicit lifecycle
controls.

Current productive transitions are:

- Draft → Active / Archived;
- Active → Paused / Completed / Archived;
- Paused → Active / Completed / Archived;
- Completed → Active / Archived;
- Archived → Active.

Only Active projects accept new timers and manual Work.

Clickdummy consequence:

- Project detail keeps Work, Estimates and Invoices in one commercial context;
- the active Project exposes Timer, Time, Fixed, Quantity and Expense actions;
- Project rename is explicit and states that issued snapshots/history remain
  unchanged;
- lifecycle controls expose only transitions allowed by the productive domain;
- the selected Project in the Customer workspace exposes compact lifecycle
  controls instead of forcing unrelated module navigation.

### #5 — structured billable work

Issue #5 establishes Time / Fixed / Quantity / Expense as the structured work
foundation and requires invoices to consume existing commercial work instead of
inventing it at invoice time.

The clickdummy therefore keeps Work central to Project and does not model an
independent invoice-first data-entry architecture.


### #84 — explicit Estimate sections

Issue #84 is **Class A — implemented productive v1 baseline** and is present on current Kalkurama `main` (PR #119).

The productive implementation provides optional ordered sections with title/description, optional ungrouped items, draft management and immutable issued/revision presentation.

Clickdummy consequence:

- `estimate.html` groups items with the productive `data-estimate-section` / `data-estimate-section-item` structure;
- section title, description, order and section totals are visible on the product-facing Estimate mirror;
- items may remain ungrouped because sections are optional;
- commercial calculations remain item-based and exact;
- Styleguide examples now document a shipped product pattern rather than a future-only concept.

### #85 — explicit Invoice line discounts

Issue #85 is **Class A — implemented productive v1 baseline** and is present on current Kalkurama `main` (PR #121).

Invoice Lines persist explicit pre-discount amount, discount rate/amount, post-discount net, tax and gross snapshots. Draft lines may change the discount before issue; issued lines remain immutable and EN 16931 CII carries a line allowance when applicable.

Clickdummy consequence:

- `invoice.html` exposes the productive Discount column and immutable discount amount/rate snapshot on issued lines;
- source quantity/unit price and post-discount tax/gross stay visibly consistent;
- the static issued example does not show draft-only editing controls, matching productive state semantics;
- Styleguide discount examples document the shipped snapshot model rather than an unimplemented proposal.

### #86 — audited corrections for fixed, quantity and expense work

Issue #86 is **Class A — implemented productive v1 baseline** and is present on current Kalkurama `main` (PR #122).

Only `unbilled` Fixed, Quantity and Expense entries may be corrected directly. The productive flow requires a reason, preserves currency and commercial identity, and appends a `WorkEntryCorrectionEvent` with actor/time plus before/after values. `selected_for_draft_invoice`, invoiced, non-billable and written-off entries remain protected.

Clickdummy consequence:

- `work.html` exposes Correct actions for the three productive non-time work types and links to the matching static correction-form mirrors;
- recent non-time correction history is represented through `data-work-correction-history`;
- original and corrected commercial values, actor and reason remain visible;
- correction does not mutate issued documents or bypass billing-state rules;
- Styleguide correction examples now document the shipped audit pattern.


## Scope guard

Until the productive source explicitly changes, the clickdummy must not add
unrelated accounting/ERP modules, provider integrations, team approvals or
other beyond-baseline concepts merely as UI experiments.
