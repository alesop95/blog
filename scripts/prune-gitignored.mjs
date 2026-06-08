// Untrack files that are still in the Git index but now match .gitignore.
//
// Git only ignores *untracked* files: anything committed before a pattern was
// added to .gitignore keeps being tracked. This script finds those leftovers
// and removes them from the index (`git rm --cached`, keeping them on disk), so
// the gitignore is actually enforced. It runs from the pre-commit hook (so a
// .gitignore change auto-prunes on the next commit) and on demand via
// `pnpm gitignore:prune`.
import { spawnSync } from 'node:child_process'

function git(args, opts = {}) {
  return spawnSync('git', args, { encoding: 'utf8', ...opts })
}

// Tracked files that match the standard ignore rules (.gitignore etc.).
const listed = git(['ls-files', '-z', '--cached', '--ignored', '--exclude-standard'])
if (listed.status !== 0) process.exit(0) // not a git repo / git error -> never block

const files = (listed.stdout ?? '').split('\0').filter(Boolean)
if (files.length === 0) {
  console.log('▸ gitignore prune: nothing tracked-but-ignored. Clean.')
  process.exit(0)
}

console.error('▸ Untracking files now matched by .gitignore (they stay on disk):')
for (const f of files) console.error(`  - ${f}`)

// Stages the removals; from a pre-commit hook they ride along in the commit.
const removed = git(['rm', '-r', '--cached', '--quiet', '--ignore-unmatch', '--', ...files], {
  stdio: 'inherit',
})
process.exit(removed.status ?? 0)
