# Kalkurama Clickdummy

UIkit-first, HTML-first static mirror and UI/UX laboratory for the productive Kalkurama application.

Product source of truth:

- `cemfirat/kalkurama`
- inspected baseline: `3c0c2eb77ef8164770586f5b34c78db6f4127762`
- product source: [docs/PRODUCT-SOURCE.md](docs/PRODUCT-SOURCE.md)
- themes: [docs/THEMES.md](docs/THEMES.md)
- styleguide: [docs/STYLEGUIDE.md](docs/STYLEGUIDE.md)
- local Kalkurama Studio: [docs/STUDIO.md](docs/STUDIO.md)
- transfer rules: [docs/UI-TRANSFER.md](docs/UI-TRANSFER.md)

Public preview:

- [Kalkurama Clickdummy](https://cemfirat.github.io/kalkurama-clickdummy/)
- [Kalkurama Styleguide](https://cemfirat.github.io/kalkurama-clickdummy/styleguide.html)

The public GitHub Pages build is read-only. Product-facing shell/layout/classes mirror the recorded productive Kalkurama baseline; only mock values, static links and prototype-only tooling may differ. Productive visual identity is part of the mirror baseline; the separate UIkit Standard mode stays a read-only framework reference. Local Theme/Markup editing remains available only through Kalkurama Studio.

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
- `estimate.html` — current productive Estimate detail mirror
- `invoices.html`
- `invoice.html` — current productive Invoice detail mirror
- `payments.html`
- `credit-notes.html`
- `services.html`
- `work.html`
- `time.html`
- `settings.html`
- `styleguide.html` — UIkit reference plus documented Kalkurama product patterns and clearly separated future-only experiments

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
