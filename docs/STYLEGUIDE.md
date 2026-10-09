# Styleguide

`styleguide.html` is the UIkit-oriented visual reference for the Kalkurama
clickdummy.

It is a UI laboratory and documentation surface, not a productive Kalkurama
module.

## Goal

The Styleguide documents:

- theme inheritance
- Kalkurama theme tokens
- Base & typography
- Grid & Flex layout
- UIkit components actually used by Kalkurama
- true Kalkurama-specific product compositions
- the exact HTML markup behind every component Preview.

## Documentation pattern

Each component section follows the same pattern:

1. short description
2. link to the corresponding upstream UIkit documentation
3. **Preview**
4. **Markup**
5. relevant variants/modifiers in the example where useful.

The current sections are:

- Theme System
- Tokens
- Base & Typography
- Grid & Flex
- Button
- Card
- Form
- Table
- Navigation
- Accordion
- Tabs & Switcher
- Dropdown & Drop
- Offcanvas
- Icon, Close & Tooltip
- Status & Alert
- Feedback & Modal
- Kalkurama Project / Work Context
- Kalkurama Estimate Sections
- Kalkurama Invoice Line Discounts
- Kalkurama Audited Work Corrections.

## Single source for Preview + Markup

Component examples live in:

`partials/styleguide/`

A section includes the same example twice:

```html
<!-- @include partials/styleguide/buttons.html -->
<!-- @include-code partials/styleguide/buttons.html -->
```

- `@include` renders the live Preview.
- `@include-code` escapes the exact same source into the Markup view.

This prevents documentation and actual example markup from drifting apart.

## UIkit-first rule

The Styleguide must not become a second component framework.

Use native UIkit markup/classes first.

Examples:

- `uk-button`
- `uk-card`
- `uk-form-stacked`
- `uk-table`
- `uk-nav`
- `uk-subnav`
- `uk-accordion`
- `uk-tab` + `uk-switcher`
- `uk-dropdown` / `uk-drop`
- `uk-offcanvas`
- `uk-icon` / `uk-close` / `uk-tooltip`
- `uk-alert`
- `uk-modal`.

Kalkurama-specific classes are allowed only for real product compositions such
as:

- persistent customer/project shell
- project row selection and running timer
- Estimate Sections
- Invoice Line discount snapshots
- audited Work correction context
- dense commercial panels and document context.

Do not restyle standard UIkit components in `prototype.less`.

## Interaction reference

The Styleguide also covers the native UIkit interaction primitives used to keep
dense business interfaces compact:

- Accordion / disclosure;
- Tabs + Switcher;
- Dropdown / Drop;
- Offcanvas;
- Icon / Close / Tooltip utilities.

These are framework references, not new Kalkurama product requirements. Generic
utility icons may use UIkit; branded shell controls continue to use Kalkurama's
owned icon assets.

## Product emphasis

Kalkurama is data-heavy business software.

The Styleguide therefore gives more weight to:

- tables
- forms
- statuses
- navigation/context
- compact actions
- project/work/document compositions

than to decorative showcase components.

Cards are documented because Kalkurama uses them for summaries, but they are not
the default replacement for dense operational tables/panels.

## Kalkurama product patterns

The product section is split by commercial responsibility instead of using one
generic showcase:

- **Project / Work Context** — persistent project context, Timer and unbilled Work
- **Estimate Sections** — productive optional ordered grouping from #84 / PR #119
- **Invoice Line Discounts** — productive explicit pre-discount/rate/amount snapshot from #85 / PR #121
- **Audited Work Corrections** — productive actor/time/reason/original-value semantics from #86 / PR #122

These three examples now document patterns already shipped in productive Kalkurama. Product-facing pages mirror production directly; Styleguide examples remain reusable documentation/laboratory samples and never override productive Twig behavior. The Work Correction example uses `partials/work-correction-audit.html` directly for both Preview and Markup.

## Add a component example

1. Create a semantic example file in `partials/styleguide/`.
2. Use native UIkit markup/classes.
3. Add a Styleguide section with Preview and Markup.
4. Link to the relevant UIkit docs page.
5. Add documentation-only layout CSS only when required.
6. Keep documentation CSS under `src/styles/prototype.less`.
7. Do not put product behavior or fake product requirements into the Styleguide.
8. Run the full static/build verification before branch CI.

## Kalkurama Studio

When the Styleguide runs through the local Vite development server, Kalkurama Studio
can open approved Kalkurama/customer LESS files directly.

Entry points include:

- **Kalkurama Studio**
- **Theme bearbeiten**
- **variables.less bearbeiten**.

The public GitHub Pages version remains read-only.

See:

`docs/STUDIO.md`

## Transfer scope

The Styleguide is prototype-only:

- `styleguide.html`
- `partials/styleguide/**`
- `src/styles/prototype.less`
- Kalkurama Studio UI/client.

These files are never promoted blindly into productive Kalkurama.

Accepted product/UI decisions must be intentionally ported into real Twig/UIkit
structures according to `docs/UI-TRANSFER.md`.
