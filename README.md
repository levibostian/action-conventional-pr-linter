![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/levibostian/action-semantic-pr?label=latest%20stable%20release)
![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/levibostian/action-semantic-pr?include_prereleases&label=latest%20pre-release%20version)

# action-semantic-pr

GitHub Action to help your project have successful pull requests that make [semantic-release](https://github.com/semantic-release/semantic-release) happy.

# Features

- Lint pull request titles to see if they match a conventional commit spec.
- If pull request title not valid, print a helpful message to PR author helping them out.
- Squash pull requests making a valid commit that matches conventional commit spec.
- Support for pull requests that add breaking changes to code base.

_Note:_ At this time, this project only supports the [conventional-commits](https://www.conventionalcommits.org/) spec. If your project uses something else (Angular, Atom, etc) then this Action will not work for you. See [feature request](https://github.com/levibostian/action-semantic-pr/issues/8) to see how you can contribute to this project!

# Getting started

- Create your workflow

```yml
name: PR bot

on:
  pull_request:
    types: [opened, reopened, edited, synchronize, labeled]

jobs:
  pr-help:
    name: PR bot
    runs-on: ubuntu-latest
    steps:
      - name: Manage PR bot
        uses: levibostian/action-semantic-pr@v2
        with:
          readToken: ${{ secrets.READ_ONLY_BOT_TOKEN }}
          writeToken: ${{ secrets.WRITE_ACCESS_BOT_TOKEN }}
          # Sets rules on the types of commits allowed on a specific branch. Example: {"beta": "fix,docs"} gives a warning on the pull request if a pull request is made into the beta branch with a type thats not fix or docs.
          branchTypeWarning: '{"beta": "fix", "main": "fix"}'
```

- Create secret `WRITE_ACCESS_BOT_TOKEN` with a GitHub personal access token. The GitHub account the access token belongs to needs to have write access to the GitHub repository. This means the account is added as a [collaborator](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-user-account/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository) in your public or private GitHub account. 

- Create secret `READ_ONLY_BOT_TOKEN` with a GitHub personal access token. If this Action is installed in a *private* GitHub repository, the token can be the same token used for `WRITE_ACCESS_BOT_TOKEN`. If this Action is installed in a *public* GitHub repository, for security reasons, make sure that (1) the GitHub account that this access token belongs to is *not* added as a collaborator on *any* GitHub repositories and (2) the access token that you generate for `READ_ONLY_BOT_TOKEN` has `public_repo` scope, only. [Learn more](https://danger.systems/js/guides/getting_started.html#setting-up-an-access-token). 

- Create secret `READ_ONLY_BOT_TOKEN` with key being a GitHub personal access token with push permission. This bot will comment on pull requests and merge pull requests.

- Modify your semantic-release configuration file to use the `conventionalcommits` spec:

```json
{
  "plugins": [
    ["@semantic-release/commit-analyzer", {
      "preset": "conventionalcommits"
    }],
    ["@semantic-release/release-notes-generator", {
      "preset": "conventionalcommits"
    }],
  ]
}
```

- Create pull requests! The bot will run and comment on your pull requests to lint PR titles and merge PRs.

# Development

- `npm install`
- `npm test` to run automated tests

At this time, the Action does not have a lot of automated tests written. Instead, the Action is tested by running the Action on pull requests on this repository. Therefore, modify `.github/workflows/test-action.yml` to make sure that it will run successfully to test the Action on this repository.

# Deployment

Appropriately, this project is deployed using [semantic-release](https://github.com/semantic-release/semantic-release) and the PR titles use the [conventional commit format](https://www.conventionalcommits.org/).
