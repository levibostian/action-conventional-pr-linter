import { getInput } from "./input"
import { getNextReleaseType, lintPrTitle } from "./lint"
import { context as githubContext, getOctokit } from "@actions/github"
import { terminate } from "./env"
import * as log from "./log"
import * as cathy from "cathy"
import { getInvalidPrTitleHelp, getValidPrTitleMessage } from "./helper_messages"
;(async () => {
  log.debug("Checking if action was triggered by a PR")

  if (githubContext.eventName != "pull_request") {
    log.info(
      "GitHub Action workflow trigger is not a pull_request. Nothing for me to do. I'll just exit."
    )
    return terminate()
  }

  log.debug("Getting input and context from action")
  const input = getInput()
  const prNumber = githubContext.payload.pull_request?.number
  if (!prNumber) {
    log.info(
      "GitHub Action must not have triggered by a pull_request because I cannot find a pull request number. Nothing for me to do. I'll just exit."
    )
    return terminate()
  }
  log.debug(`Action running against PR ${prNumber}`)

  const octokit = getOctokit(input.token)
  const pullRequest = await octokit.rest.pulls.get({
    owner: githubContext.repo.owner,
    repo: githubContext.repo.repo,
    pull_number: prNumber
  })

  log.debug(`GitHub pull request: ${JSON.stringify(pullRequest.data)}`)
  const prTitle = pullRequest.data.title
  const prAuthor = pullRequest.data.user?.login || ""

  const isTitleValid = await lintPrTitle(prTitle, "@commitlint/config-conventional")
  if (!isTitleValid) {
    await cathy.speak(
      getInvalidPrTitleHelp({
        author: prAuthor
      }),
      {
        githubToken: input.token,
        githubRepo: `${githubContext.repo.owner}/${githubContext.repo.repo}`,
        githubIssue: prNumber,
        updateExisting: true,
        updateID: "action-semantic-pr_help-pr-title"
      }
    )

    return terminate(new Error("Pull request title is not valid."))
  }

  const nextReleaseType = await getNextReleaseType(prTitle)
  const willCauseRelease = nextReleaseType != undefined

  await cathy.speak(
    getValidPrTitleMessage({
      author: prAuthor,
      willCauseRelease,
      nextReleaseType
    }),
    {
      githubToken: input.token,
      githubRepo: `${githubContext.repo.owner}/${githubContext.repo.repo}`,
      githubIssue: prNumber,
      updateExisting: true,
      updateID: "action-semantic-pr_help-pr-title"
    }
  )

  log.info("Looks like the PR title is valid!")

  // time to merge if we determine it's ready.

  if (pullRequest.data.merged || pullRequest.data.closed_at) {
    log.info("Pull request is not open. Nothing else for me to do, existing.")
    return terminate()
  }

  // check labels to see if it's ready to be merged
  let isReadyToMerge = false
  pullRequest.data.labels.forEach((label) => {
    if (label.name == "Ready to merge") {
      isReadyToMerge = true
    }
  })

  if (!isReadyToMerge) {
    log.info("PR title valid, but not ready to merge. Nothing else for me to do, exiting.")
    return terminate()
  }

  log.info("Merging PR")
  await octokit.rest.pulls.merge({
    owner: githubContext.repo.owner,
    repo: githubContext.repo.repo,
    pull_number: prNumber,
    commit_title: prTitle,
    commit_message: "", // in the future, we can populate this with breaking changes.
    merge_method: "squash"
  })
  await octokit.rest.issues.removeLabel({
    owner: githubContext.repo.owner,
    repo: githubContext.repo.repo,
    issue_number: prNumber,
    name: "Ready to merge"
  })

  terminate()
})()

// const output: Output = {
//   text: getOutputText(input.text)
// }

// setOutput(output)
