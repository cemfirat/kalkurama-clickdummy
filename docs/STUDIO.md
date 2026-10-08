# Kalkurama Studio

Kalkurama Studio is the local LESS editing and controlled Git handoff surface embedded
in the Kalkurama Styleguide.

Start:

```bash
npm install
npm run studio
```

Open:

`http://127.0.0.1:5173/styleguide.html`

## Editing boundary

Kalkurama Studio:

- exists only in the Vite development server;
- binds explicitly to `127.0.0.1`;
- accepts loopback requests only;
- writes only allowlisted Kalkurama/customer `.less` files;
- keeps `src/themes/standard.less` read-only;
- validates affected themes with Less before accepting a save;
- rolls invalid writes back;
- exposes the exact Git status and diff against `HEAD`;
- contains no GitHub token, PAT or GitHub API write credential.

Editable files come from:

```text
src/themes/kalkurama.less
src/themes/kalkurama/*.less
src/themes/customers/*.less
src/themes/customers/*/*.less
```

## Local Git Sync

Git Sync is intentionally narrower than a terminal or general Git client.

The browser can request only two fixed operations:

- local final verification;
- publish the current Kalkurama Studio candidate.

There is no arbitrary command endpoint.

### Local verification

**Lokal prüfen** runs:

```bash
npm run verify
```

against the exact working tree.

The check must pass before a candidate can be committed and pushed.

### Commit & Push + CI

The publish flow is:

```text
saved LESS changes
      ↓
validate Git state
      ↓
fetch origin/main
      ↓
npm run verify
      ↓
studio/theme-<timestamp>
      ↓
stage allowlisted Studio files only
      ↓
commit
      ↓
push studio branch
      ↓
push identical commit to verify/studio-theme-<sha>
      ↓
GitHub branch CI
      ↓
PR only after green CI
```

The Studio does **not** create a pull request.

## Git safety rules

Git Sync proceeds only when all of these conditions are true:

- `origin` is exactly `cemfirat/kalkurama-clickdummy`;
- current branch is `main` or an existing `studio/*` branch;
- local `main` is synchronized with `origin/main`, or an existing Studio branch
  already contains current `origin/main`;
- Git `user.name` and `user.email` are configured;
- there are no staged changes;
- every working-tree change belongs to the Kalkurama Studio allowlist;
- no renamed files are part of the candidate;
- the commit message is one line with 5–120 characters;
- local full verification passes.

The service never stages unrelated files.

If a commit hook or commit itself fails, the controlled Kalkurama Studio paths are
unstaged again; working-tree content is not discarded.

## GitHub authentication

The browser receives no GitHub credentials.

Push authentication is handled by the user's normal local Git configuration,
for example macOS Keychain/credential helper or SSH.

Git commands run with interactive terminal prompting disabled so the Vite server
cannot hang on an authentication prompt. Authentication failures are returned to
the Studio as errors.

## Branch CI

Publishing creates a unique verify branch:

```text
verify/studio-theme-<first 12 chars of commit SHA>
```

The existing `Branch Verify` workflow runs because the branch matches
`verify/**`.

Pushing the normal `studio/*` branch itself does not trigger that workflow.

If the verify branch for the same commit already exists, it is reused rather than
creating an additional CI run.

## What Git Sync does not do

Kalkurama Studio does not:

- create or merge pull requests;
- push directly to `main`;
- force-push;
- delete branches;
- modify GitHub repository settings;
- run arbitrary shell commands;
- stage non-Studio files;
- bypass local verification or branch CI.

Permanent rule:

**No PR before green branch CI.**

## Clean local working tree

The repository ignores local/install output that must never become a Studio
candidate:

- `node_modules/`
- `dist/`
- `package-lock.json`
- `.DS_Store`
- `*.log`

The clickdummy intentionally continues using the existing no-lockfile
`npm install` workflow.
