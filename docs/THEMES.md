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
src/themes/
├── standard.less
├── _system-tokens.less
├── kalkurama.less
├── kalkurama/
│   ├── _import.less
│   ├── variables.less
│   └── offcanvas.less
└── customers/
    └── README.md
```

`standard.less` imports UIkit's official `uikit.theme.less`.

`kalkurama.less` inherits Standard and applies Kalkurama variables/hooks.

Customer themes inherit Kalkurama only when real customer branding is needed.

## Rules

- never edit files inside `node_modules/uikit`
- use UIkit variables first
- use UIkit hooks when variables are insufficient
- avoid direct `.uk-*` reskins in shell/product/prototype styles
- customer themes do not fork product layout
- do not invent customer branding or assets.
