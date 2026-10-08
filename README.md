# Kalkurama Clickdummy

UIkit-first, HTML-first UI/UX laboratory for Kalkurama.

Product source of truth:

- `cemfirat/kalkurama`
- inspected baseline: `2bd658c65020984fe2583161ae8cceeae583f618`
- product source: [docs/PRODUCT-SOURCE.md](docs/PRODUCT-SOURCE.md)
- themes: [docs/THEMES.md](docs/THEMES.md)
- styleguide: [docs/STYLEGUIDE.md](docs/STYLEGUIDE.md)
- local Theme Studio: [docs/THEME-STUDIO.md](docs/THEME-STUDIO.md)
- transfer rules: [docs/UI-TRANSFER.md](docs/UI-TRANSFER.md)

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
- `invoices.html`
- `payments.html`
- `credit-notes.html`
- `services.html`
- `work.html`
- `time.html`
- `settings.html`
- `styleguide.html`

## Local development

```bash
npm install
npm run dev
```

Theme Studio:

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
