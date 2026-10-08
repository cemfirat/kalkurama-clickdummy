# Clickdummy ↔ Kalkurama UI transfer

Kalkurama is productive Symfony/Twig software. The clickdummy is an editable
HTML/UIkit UI laboratory.

Direction matters: productive Kalkurama UI is mirrored structurally into the clickdummy; clickdummy-originated changes are never copied blindly back into production.

## Kalkurama → clickdummy

Product truth flows from:

- Product Definition
- Billings-like UX target
- scoped issues
- productive Twig/CSS implementation.

For the recorded baseline, product-facing shell/layout/classes are mirrored one-to-one in intent and structure. Twig data/route expressions are replaced by mock values and static links only.

## Clickdummy → Kalkurama

Potentially transferable:

- root product HTML structure as UI/interaction decisions
- shared shell partials
- Kalkurama theme variables/hooks and owned theme assets
- shell/product LESS compositions
- behavior decisions that do not depend on mock data.

Never promote automatically:

- mock content
- Styleguide-only files
- Kalkurama Studio
- transfer metadata/docs
- fake customers/projects/totals.

## Required sequence

1. freeze exact clickdummy SHA
2. refresh current `kalkurama/main`
3. inspect relevant docs/issues
4. calculate delta from clickdummy transfer checkpoint
5. classify accepted UI decisions
6. create focused Kalkurama branch
7. port into real Twig/UIkit while preserving domain/auth/data behavior
8. static/build tests first
9. one strong branch-CI candidate
10. **No PR before green branch CI**
11. log exact clickdummy and Kalkurama SHAs after successful integration.
