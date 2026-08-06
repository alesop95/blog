# ADR-016 - Auto-untrack files that become gitignored (pre-commit hook)

**Status**: Accepted · **Date**: 2026-06-08 · **Session**: #8

## Context

Git only ignores **untracked** files. A file committed *before* a pattern is added to `.gitignore` keeps being tracked - editing `.gitignore` does not remove it from versioning. This is a common foot-gun: you ignore `public/og/`, but if it was ever committed it stays in the repo (and history). We want changing `.gitignore` to actually *enforce* the ignore.

## Decision

A small **pre-commit hook** untracks any file still in the index that now matches `.gitignore`, on every commit (so a `.gitignore` edit prunes on the next commit).

- `scripts/prune-gitignored.mjs` - the logic: `git ls-files --cached --ignored --exclude-standard` finds tracked-but-ignored files; `git rm -r --cached --ignore-unmatch` removes them from the index (**kept on disk**). Logs what it untracked. Never blocks (exits 0 if not a git repo).
- `.githooks/pre-commit` - runs the script. Its `git rm --cached` stages the removals, so they ride along in the same commit.
- Installed via the package `prepare` script: `git config core.hooksPath .githooks || exit 0` (runs on `pnpm install`; `|| exit 0` so non-git contexts don't fail). Idempotent.
- On demand: `pnpm gitignore:prune`.

Runs on **every** commit (cheap: one `git ls-files`) and is a no-op unless something is tracked-but-ignored - strictly more useful than only firing on `.gitignore` edits, and it only ever touches files already declared ignored.

## Consequences

- New: `scripts/prune-gitignored.mjs`, `.githooks/pre-commit`, scripts `prepare` + `gitignore:prune`.
- **Audit at adoption (this session): zero tracked-but-ignored files** - nothing had slipped in, so nothing was removed; the hook is preventive going forward.
- Cross-platform: Git for Windows runs `#!/bin/sh` hooks without the exec bit; on Unix clones you may need `chmod +x .githooks/pre-commit` once.
- The hook auto-modifies the index during commit (only for already-ignored files) and prints them, so the change is visible.
