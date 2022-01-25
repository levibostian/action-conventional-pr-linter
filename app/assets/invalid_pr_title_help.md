**Hey, there @{author} 👋🤖. I'm a bot here to help you.**

This project uses a special format for pull requests titles. Don't worry, it's easy!

This pull request title should be in this format:

```
<type>: short description of change being made
```

where `<type>` is one of the following:

- `feat:` - A new feature is being added by this pull request.
- `fix:` - A bug is being fixed by this pull request.
- `docs:` - This pull request is making documentation changes, only.
- `refactor:` - A change was made that doesn't fix a bug or add a feature.
- `test:` - Adds missing tests or fixes broken tests.
- `style:` - Changes that do not effect the code (whitespace, linting, formatting, semi-colons, etc)
- `perf:` - Changes improve performance of the code.

- `build:` - Changes to the build system (maven, npm, gulp, etc)
- `ci:` - Changes to the CI build system (Travis, GitHub Actions, Circle, etc)

- `chore:` - Other changes to project that don't modify source code or test files.
- `revert:` - Reverts a previous commit that was made.

**If your pull request causes breaking changes** to the code base, you need to add a `!` after the `<type>`: `feat!: remove deprecated v1 endpoints`

<details>
<summary>Examples</summary>
<br>
```
feat: edit profile photo
feat!: remove deprecated v1 endpoints
build: update npm dependencies
style: run formatter 
```
</details>

Need more examples? Want to learn more about this format? [Check out the official docs](https://www.conventionalcommits.org/).

**Note:** If your pull request does multiple things such as adding a feature _and_ makes changes to the CI server _and_ fixes some bugs then you might want to consider splitting this pull request up into multiple smaller pull requests. Small and focused pull requests are preferred by the reviewers of the code.
