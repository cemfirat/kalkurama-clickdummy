# Kalkurama UI transfer log

Append-only record of clickdummy baselines and intentionally promoted UI decisions.

| Date | Clickdummy commit | Kalkurama source | Scope | Result |
| --- | --- | --- | --- | --- |
| 2026-10-08 | `5f36146c4faf9ddd63a8ad9e2c207bcb6730d2bc` | `2bd658c65020984fe2583161ae8cceeae583f618` | Initial HTML-first/UIkit-first foundation: Billings-like customer/project shell, product pages, Theme hierarchy, Styleguide and local Theme Studio | Superseded by refined foundation baseline |

| 2026-10-08 | `362574766419b8f88bfe4fa05ddce65f4ab768a1` | `2bd658c65020984fe2583161ae8cceeae583f618` | Refined foundation: issue-alignment guard + explicit mobile customer sidebar variant | Superseded by expanded Styleguide baseline |

| 2026-10-08 | `120b85fd986e1b961f437aecf954b239f96405a2` | `2bd658c65020984fe2583161ae8cceeae583f618` | Expanded UIkit-oriented Styleguide with synchronized Preview/Markup and Kalkurama-specific documentation priorities | Superseded by Estimate Sections baseline |

| 2026-10-08 | `a4d7ae3f915b1022cda9ab86e9da8516f6853be4` | `2bd658c65020984fe2583161ae8cceeae583f618` | Estimate Sections #84: explicit ordered optional sections, ungrouped items and issued-snapshot semantics | Superseded by Invoice Line Discounts baseline |

| 2026-10-08 | `fd39664fc00620f8c137455beedfcbfaf48bfab1` | `2bd658c65020984fe2583161ae8cceeae583f618` | Invoice Line Discounts #85: pre-discount, discount rate/amount, issued snapshot and Work traceability | Active baseline; no production promotion |

## Logging rule

- Baseline rows record an audited re-anchoring of the UI lab.
- Promotion rows are added only after a clickdummy decision is successfully ported to productive Kalkurama.
- Every row uses exact source/target SHAs.
