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

### Prepare and save (no GitHub Actions)

Use **Vorbereiten und sichern (ohne Actions)** after saving the editor buffer.
The existing `/__studio/git/publish` endpoint now performs only this action.
It never creates a verification branch, including when an older browser sends
extra fields in its request.

The action validates the repository, branch, identity, allowlist and workflow
policy, fetches and checks current `origin/main`, then runs both complete local
commands: `npm run verify` and `npm run transfer:status`. A failure stops before
branch creation, staging or commit. A concurrent file/HEAD/main change also stops
the operation instead of saving a different, untested candidate.

Only allowlisted changes are committed to `studio/ui-<timestamp>` or the current
`studio/*` branch. An explicit exact-SHA refspec pushes only that development
branch, with automatic tag following disabled. The remote SHA is read back.
The result includes the full commit SHA and local report, and displays
**Remote-CI ausstehend**. This is a stored development candidate, not a release
and not proof of successful GitHub CI.

A clean, already saved Studio commit can be saved again without a new commit.
If a push fails after the local commit, the commit is retained. Check the remote
state and use the same save action again; do not manually reset or discard it.

### Request remote verification separately

Use **GitHub-Prüfung starten** only when GitHub Actions capacity is available.
A separate confirmation shows the exact SHA and warns that Actions is requested.
There is no automatic invocation from saving, file editing or page loading.

The `/__studio/git/remote-verify` endpoint requires `confirmRemoteVerification`
to be the boolean `true` plus the full saved `commitSha`. The current branch must
be a clean `studio/*` branch at that exact commit, and the remote development
branch must already contain exactly that SHA. Both full local commands run
again; current main, working tree and the saved remote SHA are rechecked.

Only then may it create `verify/studio-ui-<12-character-sha>` at that SHA. An
existing identical ref produces **no push and no extra run**. A conflicting ref,
an ambiguous response or an unreachable remote is an error, never "not found".
Creation uses an explicit empty expected-value lease: the ref must still be
absent on the server. This is a create-only condition, not permission to rewrite
an existing branch. A concurrently created different ref is never advanced.

The UI reports **requested** or **already requested**, not "CI passed" and not
proof that a runner started. Inspect the actual GitHub result for this exact SHA.
The Studio creates no pull request; **No PR before green branch CI** still applies.

Editor and Git controls are locked while a request is in progress. Unsaved editor
changes block both Git actions. A new file edit invalidates the selected remote
candidate. After a page reload, a clean Studio SHA can be selected again, but the
server always rechecks whether it has actually been saved remotely.

## Git safety rules

Git Sync proceeds only when:

- both fetch and push URLs of `origin` point only to `cemfirat/kalkurama-clickdummy`;
- mirror remotes and extra push destinations are rejected;
- `HEAD` and refreshed `origin/main` contain exactly the two reviewed workflow
  files with the pinned blob IDs in `assertStudioWorkflowPolicy()`. Their current
  triggers are `verify/**` and `main`, plus manual dispatch; there are no PR/create
  triggers. A new or changed workflow stops saving pending a policy review;
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
- force-update an existing branch;
- delete branches;
- modify GitHub repository settings;
- run arbitrary shell commands;
- write files outside the Studio allowlist;
- bypass local verification or branch CI.

Permanent rule:

**No PR before green branch CI.**

## Workflow tests

`npm run test:studio` runs the Git-workflow and client-control tests using only
Node built-ins and Git. It is included in `npm run verify` before the existing
static checks and all three builds; no prior check is removed.

The Git tests evaluate the real configuration functions and use disposable local
Git repositories. Only transport is redirected locally and the two npm commands
are explicit test doubles, including failure cases. The UI tests evaluate the
actual client against DOM/API/UIkit doubles. These are workflow and behavior
checks, **not evidence of a Vite/Less build or real-browser layout verification**.
The full `npm run verify` and `npm run transfer:status` on a complete checkout
remain required before accepting this feature for release.

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
