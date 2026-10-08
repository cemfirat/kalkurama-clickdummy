# Kalkurama Clickdummy

UIkit-first, HTML-first UI/UX laboratory for Kalkurama.

Product source of truth:

- `cemfirat/kalkurama`
- inspected baseline: `2bd658c65020984fe2583161ae8cceeae583f618`
- product source: [docs/PRODUCT-SOURCE.md](docs/PRODUCT-SOURCE.md)
- themes: [docs/THEMES.md](docs/THEMES.md)
- styleguide: [docs/STYLEGUIDE.md](docs/STYLEGUIDE.md)
- local Kalkurama Studio: [docs/STUDIO.md](docs/STUDIO.md)
- transfer rules: [docs/UI-TRANSFER.md](docs/UI-TRANSFER.md)

Public preview:

- [Kalkurama Clickdummy](https://cemfirat.github.io/kalkurama-clickdummy/)
- [Kalkurama Styleguide](https://cemfirat.github.io/kalkurama-clickdummy/styleguide.html)

The public GitHub Pages build is read-only. Local Theme/Markup editing remains available only through Kalkurama Studio.

## Product direction

The clickdummy follows Kalkurama's working-product direction:

```text
Customer
  → Project
    → Work / billable entries
      → Estimate
        → Invoice
          → Payment
```

The daily workspace is customer/project-first. Overview and global document lists
are secondary destinations.

Billings Pro is an interaction-architecture reference, not a visual template.

## Pages

- `index.html` — selected customer/project daily workspace
- `overview.html`
- `project.html`
- `estimates.html`
- `estimate.html` — Estimate draft/detail with explicit sections
- `invoices.html`
- `invoice.html` — Invoice draft/detail with explicit line discounts
- `payments.html`
- `credit-notes.html`
- `services.html`
- `work.html`
- `work-correction-fixed.html` — audited correction prototype for unbilled fixed work
- `work-correction-quantity.html` — audited correction prototype for unbilled quantity work
- `work-correction-expense.html` — audited correction prototype for unbilled expenses
- `time.html`
- `settings.html`
- `styleguide.html`

## Local development

```bash
npm install
npm run dev
```

Kalkurama Studio:

```bash
npm run studio
```

Verification:

```bash
npm run verify
npm run transfer:status
```

## Permanent rules

- UIkit is the design-system foundation.
- Page/product markup stays in HTML, not JavaScript renderers.
- Shared shell belongs in `partials/`.
- UIkit Standard → Kalkurama → optional Customer theme.
- Customer/project context remains visible in daily work.
- Mock content is never product authority.
- No production credentials/APIs/writes.
- **No PR before green branch CI.**
