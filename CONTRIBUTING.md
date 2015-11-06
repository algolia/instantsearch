Hi collaborator!

We use **pull request** based approach to development.

**Have a fix or a new feature**? Search for corresponding issues first then
create a new one.

If you have a new **API proposal** or change, create an issue describing it precisely:
- JavaScript example
- Resulting DOM/effect

Here's an example: [New widget: hitsPerPageSelector (#331)](https://github.com/algolia/instantsearch.js/issues/331).

# Workflow

Most of our work should be based on issues. So that we are sure to have at least two or three people that agreed we needed to change something.

Then, when you are ready:
- **assign** the issue to yourself, change the label to `in progress`. You can use the [waffle.io board](https://waffle.io/algolia/instantsearch.js/join). 
- **create a branch** starting from the **develop** branch, name it like feat/blabla, fix/blabla, refactor/blabla
- see the [development workflow](#development-workflow)
- use our [commit message guidelines](#commit-message-guidelines) to provide a meaningful commit message: it will be inserted into the changelog automatically
- add a [#fix #issue](https://help.github.com/articles/closing-issues-via-commit-messages/) when relevant, in the commit body
- **submit** your pull request to the develop branch
- Add either `do not merge` or `ready for review` labels given your context
- wait for **review**
- do the necessary changes and add more commits
- once you are done, [squash](http://gitready.com/advanced/2009/02/10/squashing-commits-with-rebase.html) your commits to avoid things like "fix dangling comma in bro.js", "fix after review"
  - example:
    - `feat(widget): new feature blabla..`
    - `refactor new feature blablabla...` (bad, not following our [commit message guidelines](#commit-message-guidelines)
  - **both commits should be squashed* in a single commit: `feat(widget) ..`
- when **updating** your feature branch on develop, **always use rebase instead of merge**

# When to close issues?

Once the fix is done, having the fix in `develop` is not sufficient, it needs to be part of a release for us to close the issue.

So that you never ask yourself "Is this released?".

Instead of closing the issue, you can just add the ` ✔ to be released` label.

# Development workflow

Join our [waffle.io board](https://waffle.io/algolia/instantsearch.js/join)!

Rapidly iterate with our example app:

```sh
npm install
npm run dev
```

Run the tests and lint:

```sh
npm test
```

## Adding/Updating a package

```sh
npm install package --save[-dev]
npm run shrinkwrap
```

## Removing a package

```sh
npm remove package --save[-dev]
npm run shrinkwrap
```

# Commit message guidelines

We use [conventional changelog](https://github.com/ajoslin/conventional-changelog) to generate our changelog from our git commit messages.

**Some examples**:
- feat(rangeSlider): add new range option to the rangeSlider
- fix(refinementList): send the full algolia result to the noResults template

Here are the rules to write commit messages, they are the same than [angular/angular.js](https://github.com/angular/angular.js/blob/7c792f4cc99515ac27ed317e0e35e40940b3a400/CONTRIBUTING.md#commit-message-format).

Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

## Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

## Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

## Scope
The scope could be anything specifying place of the commit change. For example `RefinementList`,
`refinementList`, `rangeSlider`, `CI`, `url`, `build` etc...

## Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

## Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

## Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

# Milestones

- `next` => Ideas, questions, refactors, bugs that were discuseed, turned into clear actions by the maintainers
- `x.x.x` => selected `next` actions to be done in a release
- no milestone => Still need investigation / discussion

# Labels

- `needs api proposal` good change or addition idea. Now in need of a clear API proposal
- `new widget` new widget idea
- `ready` change accepted and can be done by anyone
- `in progress` you are working on it
- `question` anything that's not an accepted bug/new feature
- `do not merge` still working on a pull request, you want feedback but it's not finished
- `✔ to be released` corresponding pull request was merged. Now waiting for a release before closing the issue
