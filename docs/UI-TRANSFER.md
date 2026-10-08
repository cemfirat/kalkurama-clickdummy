# Clickdummy ↔ Kalkurama UI transfer

Kalkurama is productive Symfony/Twig software. The clickdummy is an editable
HTML/UIkit UI laboratory.

Accepted decisions are ported, never copied blindly.

## Kalkurama → clickdummy

Product truth flows from:

- Product Definition
- Billings-like UX target
- scoped issues
- productive Twig/CSS implementation.

## Clickdummy → Kalkurama

Potentially transferable:

- root product HTML structure as UI/interaction decisions
- shared shell partials
- Kalkurama theme variables/hooks
- shell/product LESS compositions
- behavior decisions that do not depend on mock data.

Never promote automatically:

- mock content
- Styleguide-only files
- Theme Studio
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
