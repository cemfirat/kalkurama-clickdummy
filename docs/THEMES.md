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
    ├── standard-reset.less
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
    │       ├── favicon.ico
    │       └── icons/
    │           ├── plus.svg
    │           ├── cog.svg
    │           └── menu.svg
    └── customers/
        └── README.md
```

`standard.less` imports UIkit's official `uikit.theme.less`, the read-only productive CSS mirror in `src/styles/system.less`, then `standard-reset.less` to normalize only the owned Kalkurama colors back to stock UIkit reference colors.

`kalkurama.less` inherits Standard and applies Kalkurama variables/hooks.

`src/styles/system.less` mirrors the productive `cemfirat/kalkurama` `assets/styles/app.css` structural **and visual** layer for the recorded source baseline. After its three-line provenance header, the file is byte-for-byte the productive CSS. It is a source mirror, not an independent redesign or promotion surface.

`standard-reset.less` is reference-only: it restores the stock UIkit blue palette after loading the productive mirror so the Standard mode does not become a second branded theme.

`kalkurama/brand.less` re-applies the exact productive identity after that Standard-only normalization. `kalkurama/variables.less` and UIkit hooks remain the normal editable theme customization layer.

`kalkurama/images/` is the canonical clickdummy location for Kalkurama-owned theme assets such as logo, favicon and shell icons. The `icons/` set mirrors productive plus/cog/menu assets and is not replaced with unrelated UIkit shell icons.

Customer themes inherit Kalkurama only when real customer branding is needed.

## Rules

- never edit files inside `node_modules/uikit`
- use UIkit variables first
- use UIkit hooks when variables are insufficient
- avoid direct `.uk-*` reskins in prototype styles
- `src/styles/system.less` follows productive Kalkurama structure and visual baseline exactly; do not edit it as a design experiment
- `standard-reset.less` never changes product-facing `kalkurama` / `pages` output; it exists only to keep the UIkit Standard reference independent
- product-facing shell/layout changes originate in productive Kalkurama or are explicitly proposed for promotion
- customer themes do not fork product layout
- do not invent customer branding or assets.
