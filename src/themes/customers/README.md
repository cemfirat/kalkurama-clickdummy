# Customer themes

Customer themes are optional.

When a real customer-specific brand layer is needed, follow the UIkit entry-file
plus same-named-folder pattern:

```text
customers/
├── customer-slug.less
└── customer-slug/
    ├── variables.less
    ├── customer.js
    └── real customer assets
```

A customer theme inherits `../kalkurama.less`.

Do not invent branding or duplicate Kalkurama/UIkit component sources.
