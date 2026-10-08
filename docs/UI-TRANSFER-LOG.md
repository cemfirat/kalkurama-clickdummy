# Kalkurama UI transfer log

Append-only record of clickdummy baselines and intentionally promoted UI decisions.

| Date | Clickdummy commit | Kalkurama source | Scope | Result |
| --- | --- | --- | --- | --- |
| 2026-10-08 | `6a6a494e759b366e103045645e7e1143e75eabad` | `2bd658c65020984fe2583161ae8cceeae583f618` | Initial HTML-first/UIkit-first foundation | Superseded by project-context foundation baseline |

| 2026-10-08 | `8191e5db25d9f7bdecc539bec5994b3a6029e6cf` | `2bd658c65020984fe2583161ae8cceeae583f618` | Foundation with explicit customer/project context, scoped issue guards, UIkit themes, Styleguide and local Theme Studio | Active baseline; no production promotion |

## Logging rule

- Baseline rows record an audited re-anchoring of the UI lab.
- Promotion rows are added only after a clickdummy decision is successfully ported to productive Kalkurama.
- Every row uses exact source/target SHAs.
