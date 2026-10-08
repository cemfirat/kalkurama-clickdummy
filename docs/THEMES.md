# Themes

Kalkurama follows UIkit's Less theme model.

Official references:

- https://getuikit.com/docs/installation
- https://getuikit.com/docs/less

## Hierarchy

```text
UIkit Standard
      ↓
Kalkurama
      ↓
Customer (optional)
```

## Structure

```text
src/
├── styles/
│   ├── system.less
│   ├── product.less
│   └── prototype.less
└── themes/
    ├── standard.less
    ├── _system-tokens.less
    ├── kalkurama.less
    ├── kalkurama/
    │   ├── _import.less
    │   ├── variables.less
    │   ├── offcanvas.less
    │   ├── brand.less
    │   └── images/
    │       ├── logo.svg
    │       ├── favicon.svg
    │       └── favicon.ico
    └── customers/
        └── README.md
```

`standard.less` imports UIkit's official `uikit.theme.less` and the read-only productive structural mirror in `src/styles/system.less`.

`kalkurama.less` inherits Standard and applies Kalkurama variables/hooks.

`src/styles/system.less` mirrors the productive `cemfirat/kalkurama` `assets/styles/app.css` selector/layout layer for the recorded source baseline. It is a source mirror, not an independent redesign or promotion surface.

`kalkurama/brand.less` contains only Kalkurama-owned identity overrides such as the approved accent. `kalkurama/variables.less` and UIkit hooks remain the normal theme customization layer.

`kalkurama/images/` is the canonical clickdummy location for Kalkurama-owned theme assets such as logo and favicon.

Customer themes inherit Kalkurama only when real customer branding is needed.

## Rules

- never edit files inside `node_modules/uikit`
- use UIkit variables first
- use UIkit hooks when variables are insufficient
- avoid direct `.uk-*` reskins in prototype styles
- `src/styles/system.less` follows productive Kalkurama structure exactly; do not edit it as a design experiment
- product-facing shell/layout changes originate in productive Kalkurama or are explicitly proposed for promotion
- customer themes do not fork product layout
- do not invent customer branding or assets.
