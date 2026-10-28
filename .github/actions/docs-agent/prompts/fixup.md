# FIX-UP PASS

Your documentation edits are already in the working tree, but the repository's checks found problems with them. Your only job this pass is to fix those problems. The failing output is at the very end of this prompt.

Rules:

- Fix only what the checks flagged, plus anything obviously broken that you introduced. Do not start new documentation work.
- Vale findings are style-guide violations. Rewrite the prose to satisfy them; re-read `style-guide.md` if a rule is unclear. Do not add Vale exceptions.
- Unbalanced JSX tags break the Mintlify build. Fix the markup.
- A new page missing from the navigation must be added to `docs.json` or the relevant `config/*.json`, in the section its siblings live in.
- Re-run the specific check for a file after you fix it: `npx @vvago/vale doc/path/to/file.mdx`
- When you are done, set `STATUS: DONE` in `PROGRESS.md`.

The original instructions follow, for context on what the edits were meant to do.
