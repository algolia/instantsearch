# CONTINUATION PASS

You are resuming a documentation task that ran out of budget partway through. This is not a fresh start: your previous edits are still in the working tree.

Before anything else:

1. Read `PROGRESS.md` in the scratch directory. It has the plan, what is already done, and the notes you left yourself.
2. Run `git status --short` and `git diff` to see exactly what you already changed. Trust the diff over your recollection.
3. Read `CHANGES_SUMMARY.md` in the scratch directory if it exists.

Then continue from the first unchecked item. Do not redo completed work, do not re-explore the docs format, and do not rewrite files that already look right.

If every item is done, check the diff is coherent, make sure `CHANGES_SUMMARY.md` covers all of it, set `STATUS: DONE` in `PROGRESS.md`, and stop.

The original instructions follow.
