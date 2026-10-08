# Product source

The productive source of truth is:

`cemfirat/kalkurama`

Inspected baseline:

`2bd658c65020984fe2583161ae8cceeae583f618`

## Authority order

1. `docs/product/product-definition.md`
2. `docs/product/billings-like-ux.md`
3. scoped Kalkurama issues / Definition of Done
4. productive Twig/UI implementation where consistent with 1–3
5. clickdummy experiments.

The clickdummy is not a second product specification.

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
- `templates/invoice/index.html.twig`
- `templates/payment/index.html.twig`
- `assets/styles/app.css`
- `importmap.php`

The productive app pins UIkit `3.25.25`, which the clickdummy matches exactly.

## Sync rule

Before substantial clickdummy UI work:

1. refresh current `kalkurama/main`
2. inspect relevant product docs/issues
3. compare productive Twig/CSS behavior
4. record intentional deviations
5. update the clickdummy baseline only after the new source state is understood.

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

Issue #84 is **Class A — documented v1 baseline** and defines optional ordered
sections for Estimate drafts and issued snapshots.

Clickdummy consequence:

- sections group Estimate Items without becoming a free-form document designer;
- section title/description and order stay explicit;
- items may remain ungrouped because sections are optional;
- issued/revised presentation must preserve section labels and ordering;
- commercial calculations remain item-based and exact.

The clickdummy therefore prototypes explicit ordered sections using normal UIkit
controls and visible item tables rather than inventing drag-and-drop or arbitrary
layout semantics.



### #85 — explicit Invoice line discounts

Issue #85 is **Class A — documented v1 baseline** and closes the commercial
snapshot gap between Estimate Items and Invoice Lines.

The productive baseline currently snapshots quantity, unit price, net, tax and
gross on Invoice Lines but does not yet persist an explicit discount snapshot.

Clickdummy consequence:

- draft Invoice Lines expose discount rate explicitly;
- pre-discount amount and discount amount remain visible beside net/tax/gross;
- source Work traceability stays visible for imported lines;
- issuing must freeze the discount snapshot together with all other line values;
- HTML, PDF, e-invoice and full credit-note presentation must remain consistent;
- calculations remain exact and integer-backed in the productive domain.

The clickdummy models this as a commercial line field, not as a visual-only
adjustment or promotional coupon system.



### #86 — audited corrections for fixed, quantity and expense work

Issue #86 is **Class A — documented v1 baseline** and addresses the remaining
manual-correction gap for non-time Work entries.

The productive baseline already has audited Time corrections. Fixed, Quantity and
Expense entries currently have only the safe fallback: mark the incorrect entry
non-billable/written-off with a required reason and create a replacement.

Clickdummy consequence:

- direct correction is available only while the Work entry is `unbilled`;
- Fixed corrections expose work date, description, amount and currency;
- Quantity corrections expose work date, description, quantity, unit price and
  currency;
- Expense corrections expose work date, description, amount and currency;
- Work type, Work ID, Customer/Project context and Planned-Work linkage stay
  identity/history context rather than becoming silently replaceable;
- every correction requires a reason and exposes actor/time audit semantics;
- original and corrected commercial values remain visibly traceable;
- `selected_for_draft_invoice`, `invoiced`, `non_billable` and
  `written_off` entries cannot be directly corrected;
- correction does not automatically mutate or repair invoices, credit notes or
  external accounting state.

The clickdummy therefore prototypes a dedicated audited correction form rather
than a destructive edit/delete flow or an implicit write-off-and-recreate UX.

## Scope guard

Until the productive source explicitly changes, the clickdummy must not add
unrelated accounting/ERP modules, provider integrations, team approvals or
other beyond-baseline concepts merely as UI experiments.
