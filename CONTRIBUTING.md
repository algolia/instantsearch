Hi collaborator!

We use **pull request** based approach to development.

**Have a fix or a new feature**? Search for corresponding issues first then
create a new one.

If you have a new **API proposal** or change, create an issue describing it precisely:
- JavaScript example
- Resulting DOM/effect

Once **you are ready** to start working:
- **assign** the task to yourself
- **create a branch** starting from the **develop** branch
- see [development workflow](#development-workflow)
- use our [commit message guidelines](#commit-message-guidelines) to provide a meaningful commit message (it will be inserted into the changelog automatically)
- add a [#fix #issue](https://help.github.com/articles/closing-issues-via-commit-messages/) when relevant
- **submit** your pull request to the develop branch
- wait for **review**
- do the necessary changes
- **rebase** your pull request to avoid commits like "fix dangling comma in bro.js", "fix after review"
- when updating your feature branch on develop, always use rebase instead of merge

# Development workflow

Rapidly iterate with our example app:

```sh
npm install
npm run dev
```

Run the tests and lint:

```sh
npm test
```

# Commit message guidelines

We use [conventional changelog](https://github.com/ajoslin/conventional-changelog),
please [follow the rules for committing](https://github.com/ajoslin/conventional-changelog/blob/master/conventions/angular.md), it helps reducing the commit noise.

Examples:

- feat(slider): add new range option
- fix(refinementList): send the full algolia result to the noResults template

