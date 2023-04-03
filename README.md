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

You have 2 options: 

### 1. Use reusable workflow if all you need is to lint the pull request titles

```yaml
name: PR linter

on:
  pull_request:
    types: [opened, reopened, edited, synchronize, labeled]

jobs:
  lint-pr-title:
    uses: levibostian/action-semantic-pr/.github/workflows/sharable-workflow.yml@v3
    permissions:
      pull-requests: write
```

### 2. Use Action if you need other features 

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
    permissions:
      pull-request: write # github requires write permission when adding comments to an issue or pull request 
    steps:
      - name: Manage PR bot
        uses: levibostian/action-semantic-pr@v3
        with:
          readToken: ${{ secrets.GITHUB_TOKEN }}
          # Sets rules on the types of commits allowed on a specific branch. Example: {"beta": "fix,docs"} gives a warning on the pull request if a pull request is made into the beta branch with a type thats not fix or docs.
          branchTypeWarning: '{"beta": "fix", "main": "fix"}'
```

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
