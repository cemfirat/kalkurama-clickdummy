# Kalkurama Studio

Kalkurama Studio is the local editing and controlled Git handoff surface embedded
in the Kalkurama Styleguide.

Start:

```bash
npm install
npm run studio
```

Open:

`http://127.0.0.1:5173/styleguide.html`

## Editing modes

Kalkurama Studio edits two controlled text file classes. Controlled Git Sync additionally recognizes approved Kalkurama theme assets.

### Theme

Editable theme files:

```text
src/themes/kalkurama.less
src/themes/kalkurama/*.less
src/themes/customers/*.less
src/themes/customers/*/*.less
```

`src/themes/standard.less` and `src/themes/standard-reset.less` remain read-only reference files. The reset exists only to keep the independent UIkit Standard preview neutral while product-facing Kalkurama/Pages modes mirror production.

Theme saves are validated with Less before they are accepted. If compilation
fails, the previous file contents are restored automatically.

### Markup

Editable markup comes from:

- all known root HTML entry points from `vite.config.js`
- HTML partials below `partials/`

The Studio UI itself is excluded:

`partials/studio.html`

Every markup save validates all root HTML pages by expanding:

- `@include`
- `@include-code`

This catches broken include paths, malformed include JSON and missing variables
before the save is accepted as a valid Studio change.

## Local-only boundary

Kalkurama Studio:

- exists only in the Vite development server;
- binds explicitly to `127.0.0.1`;
- accepts loopback requests only;
- writes only files from the Studio allowlist;
- contains no GitHub token, PAT or GitHub API write credential;
- exposes no arbitrary shell or filesystem endpoint.

The public GitHub Pages build is read-only because the `/__studio/*` endpoints
do not exist there.

## Editor

The same editor is used for Theme and Markup files.

The active type is shown as:

- `Theme`
- `Markup`

Keyboard shortcuts:

- `Tab` inserts two spaces
- `Cmd+S` / `Ctrl+S` saves and validates

Unsaved-change protection:

- switching Studio files asks before discarding the current editor buffer;
- reloading a file or replacing the buffer with `HEAD` asks before discarding unsaved edits;
- browser reload or tab/window close triggers the native unload warning while edits are unsaved.

## Git comparison

For the selected file the Studio exposes:

- current Git status
- exact diff against `HEAD`
- exact `HEAD` file contents for the reset action.

The reset action only replaces the editor contents. Nothing is written until the
user saves.

## Local Git Sync

Git Sync uses a controlled superset of the text-editor allowlist.

It may stage and commit only:

- approved Theme files;
- approved Markup files;
- approved theme assets recursively below `src/themes/kalkurama/images/` with image extensions such as SVG, PNG, WebP, JPEG or ICO, including owned shell icons under `images/icons/`.

Theme assets are Git-controlled files, not arbitrary filesystem access. Binary assets are not opened in the text editor.

It never stages unrelated repository changes.

The publish flow is:

```text
saved Studio changes
      ↓
validate Git state
      ↓
fetch origin/main
      ↓
npm run verify
      ↓
studio/ui-<timestamp>
      ↓
stage allowlisted Studio files only
      ↓
commit
      ↓
push studio branch
      ↓
push identical commit to verify/studio-ui-<sha>
      ↓
GitHub branch CI
      ↓
PR only after green CI
```

The browser Studio does **not** create a pull request.

## Git safety rules

Git Sync proceeds only when:

- `origin` is exactly `cemfirat/kalkurama-clickdummy`;
- current branch is `main` or an existing `studio/*` branch;
- local main is synchronized with `origin/main`, or the Studio branch already
  contains current `origin/main`;
- Git `user.name` and `user.email` are configured;
- there are no staged changes;
- every working-tree change belongs to the controlled Studio Git allowlist, including approved theme assets;
- no renamed files are part of the candidate;
- the commit message is one line with 5–120 characters;
- local full verification passes.

## What Kalkurama Studio does not do

Kalkurama Studio does not:

- create or merge pull requests;
- push directly to `main`;
- force-push;
- delete branches;
- modify GitHub repository settings;
- run arbitrary shell commands;
- write files outside the Studio allowlist;
- bypass local verification or branch CI.

Permanent rule:

**No PR before green branch CI.**

## MAMP Pro

A friendly local domain may proxy to the Vite development server:

```text
local domain
    ↓
MAMP Pro / local reverse proxy
    ↓
127.0.0.1:Vite
    ↓
Kalkurama Studio + HMR
```

Do not point the Studio domain at the static `dist/` build. Writable Studio
endpoints exist only in the Vite development server.
