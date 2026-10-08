# Kalkurama Clickdummy

UIkit-first, HTML-first static mirror and UI/UX laboratory for the productive Kalkurama application.

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

The public GitHub Pages build is read-only. Product-facing shell/layout/classes mirror the recorded productive Kalkurama baseline; only mock values, static links and prototype-only tooling may differ. Local Theme/Markup editing remains available only through Kalkurama Studio.

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
- `time.html`
- `settings.html`
- `styleguide.html` — UIkit reference plus clearly separated future/prototype patterns that are not product pages

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
- Product-facing structure and visual shell mirror the recorded productive Kalkurama baseline; deliberate deviations must be documented.
- Mock content is never product authority.
- No production credentials/APIs/writes.
- **No PR before green branch CI.**
