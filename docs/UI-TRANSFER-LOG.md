# Kalkurama UI transfer log

Append-only record of clickdummy baselines and intentionally promoted UI decisions.

| Date | Clickdummy commit | Kalkurama source | Scope | Result |
| --- | --- | --- | --- | --- |
| 2026-10-08 | `5f36146c4faf9ddd63a8ad9e2c207bcb6730d2bc` | `2bd658c65020984fe2583161ae8cceeae583f618` | Initial HTML-first/UIkit-first foundation: Billings-like customer/project shell, product pages, Theme hierarchy, Styleguide and local Theme Studio | Superseded by refined foundation baseline |

| 2026-10-08 | `362574766419b8f88bfe4fa05ddce65f4ab768a1` | `2bd658c65020984fe2583161ae8cceeae583f618` | Refined foundation: issue-alignment guard + explicit mobile customer sidebar variant | Superseded by expanded Styleguide baseline |

| 2026-10-08 | `120b85fd986e1b961f437aecf954b239f96405a2` | `2bd658c65020984fe2583161ae8cceeae583f618` | Expanded UIkit-oriented Styleguide with synchronized Preview/Markup and Kalkurama-specific documentation priorities | Active baseline; no production promotion |

## Logging rule

- Baseline rows record an audited re-anchoring of the UI lab.
- Promotion rows are added only after a clickdummy decision is successfully ported to productive Kalkurama.
- Every row uses exact source/target SHAs.
