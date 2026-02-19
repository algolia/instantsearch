You will be creating a merge commit message for merging the master branch into the next branch. This is an important task that requires careful analysis of the git history and project structure to ensure a proper merge.

Use this project structure to determine the purpose of every package and subdirectory:
```
▸ examples/                            << Examples, grouped per flavor
▸ packages/                            << Packages of the project
  ▸ algiliasearch-helper/                << General utils and classes for the Algolia API
  ▸ instantsearch-ui-components/         << Shared UI components library across all flavors
  ▸ react-instantsearch/                 << Bundled React InstantSearch library
  ▸ react-instantsearch-core/            << Runtime-independent React InstantSearch version
  ▸ instantsearch.js/                    << The InstantSearch.js library
  ▸ vue-instantsearch/                   << Bundled Vue InstantSearch library
▸ tests/                               << The test utilites
  ▸ mocks/                             << Fake versions of the API, for testing
  ▸ utils/                             << Global utilities for the tests
▸ website/                             << The generated website
▸ scripts/                             << The scripts for maintaining the project
```

Use git commands to get the history of the `master` and `next` branches.

Your task is to analyze these git histories and create an appropriate merge commit message for merging master into next.

Important guidelines:
- Identify what changes have been made in master since the last merge to next
- Identify what changes have been made in next that aren't in master
- Look for potential conflicts between the branches based on which files/packages were modified
- Keep your analysis focused and concise to avoid excessive token usage
- If the git histories are very long, focus on the most recent and significant commits

After completing the merge and resolving conflicts, include a short summary at the end of the pull request description to help reviewers quickly understand the impact of the merge.

- Provide a concise overview of the major changes introduced by merging master into next, focusing on high-level behavior, public APIs, or notable refactors rather than listing every commit.
- When relevant, group changes by affected area or package (for example: InstantSearch.js core behavior, React InstantSearch APIs, Vue InstantSearch integrations).
- Clearly distinguish which major changes originated from master and which significant changes already existed on next, keeping this at a summary or example level only.
- If conflicts were resolved, briefly mention the most important ones, including which side was favored and why (for example, keeping next behavior to preserve upcoming release work, or adopting a master fix to align with current production behavior).
- Call out any potentially risky or user-visible changes that reviewers should pay extra attention to, without going into implementation details.

Keep the summary short, scannable, and focused on what matters for review and release context rather than exhaustive technical detail.
