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
