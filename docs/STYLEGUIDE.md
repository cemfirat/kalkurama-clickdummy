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
- Status & Alert
- Feedback & Modal
- Kalkurama Product Patterns.

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
- `uk-alert`
- `uk-modal`.

Kalkurama-specific classes are allowed only for real product compositions such
as:

- persistent customer/project shell
- project row selection
- running timer
- dense commercial panels
- work/document context.

Do not restyle standard UIkit components in `prototype.less`.

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

## Add a component example

1. Create a semantic example file in `partials/styleguide/`.
2. Use native UIkit markup/classes.
3. Add a Styleguide section with Preview and Markup.
4. Link to the relevant UIkit docs page.
5. Add documentation-only layout CSS only when required.
6. Keep documentation CSS under `src/styles/prototype.less`.
7. Do not put product behavior or fake product requirements into the Styleguide.
8. Run the full static/build verification before branch CI.

## Theme Studio

When the Styleguide runs through the local Vite development server, Theme Studio
can open approved Kalkurama/customer LESS files directly.

Entry points include:

- **Theme Studio**
- **Theme bearbeiten**
- **variables.less bearbeiten**.

The public GitHub Pages version remains read-only.

See:

`docs/THEME-STUDIO.md`

## Transfer scope

The Styleguide is prototype-only:

- `styleguide.html`
- `partials/styleguide/**`
- `src/styles/prototype.less`
- Theme Studio UI/client.

These files are never promoted blindly into productive Kalkurama.

Accepted product/UI decisions must be intentionally ported into real Twig/UIkit
structures according to `docs/UI-TRANSFER.md`.
