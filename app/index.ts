import { getInput } from "./input"
import { getNextReleaseType, lintPrTitle, parseTitle } from "./lint"
import { context as githubContext, getOctokit } from "@actions/github"
import { terminate } from "./env"
import * as log from "./log"
import * as cathy from "cathy"
import {
  getCommitTypeNotAllowedInBranchMessage,
  getInvalidPrTitleHelp,
  getValidPrTitleMessage
} from "./helper_messages"
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

  if (!input.readToken) {
    return terminate("I think you forgot to set a secret for `readToken` Action input?")
  }
  if (!input.writeToken) {
    return terminate("I think you forgot to set a secret for `writeToken` Action input?")
  }

  const readOnlyOctokit = getOctokit(input.readToken)

  const pullRequest = await readOnlyOctokit.rest.pulls.get({
    owner: githubContext.repo.owner,
    repo: githubContext.repo.repo,
    pull_number: prNumber
  })

  log.debug(`GitHub pull request: ${JSON.stringify(pullRequest.data)}`)
  const prTitle = pullRequest.data.title
  const prToBrach = pullRequest.data.base.ref // name of branch that you're trying to merge into
  const prAuthor = pullRequest.data.user?.login || ""

  const isTitleValid = await lintPrTitle(prTitle)
  if (!isTitleValid) {
    await cathy.speak(
      getInvalidPrTitleHelp({
        author: prAuthor
      }),
      {
        githubToken: input.readToken,
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
      githubToken: input.readToken,
      githubRepo: `${githubContext.repo.owner}/${githubContext.repo.repo}`,
      githubIssue: prNumber,
      updateExisting: true,
      updateID: "action-semantic-pr_help-pr-title"
    }
  )

  log.info("Looks like the PR title is valid!")

  // Check if we should warn about the PR not being in the correct branch
  const parsedPrTitle = await parseTitle(prTitle)
  log.debug(`parsed PR title: ${JSON.stringify(parsedPrTitle)}`)
  const allowedTypesForBranch: string[] = (input.branchTypeWarning[prToBrach] || "")
    // by default, .split() makes ['']. we want to remove empty strings
    .split(",")
    .filter((item) => item.length > 0)
  log.debug(`allowed types for PR branch: ${prToBrach}, ${allowedTypesForBranch}`)
  if (allowedTypesForBranch.length > 0 && !allowedTypesForBranch.includes(parsedPrTitle.type!)) {
    log.info(`pull request type is not allowed to go into this branch. Going to make a warning.`)

    await cathy.speak(
      getCommitTypeNotAllowedInBranchMessage({
        author: prAuthor,
        branchName: prToBrach,
        allowedTypes: allowedTypesForBranch,
        givenType: parsedPrTitle.type!
      }),
      {
        githubToken: input.readToken,
        githubRepo: `${githubContext.repo.owner}/${githubContext.repo.repo}`,
        githubIssue: prNumber,
        updateExisting: true,
        updateID: "action-semantic-pr_commit-type-help"
      }
    )

    // Do not terminate as the message of invalid type is just a warning. We can still try to merge it.
  }

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

  // Here, we have safely entered the part of the code where we can perform write operations.
  // The PR is ready to merge once someone who has write access to the repository has
  // approved of the pull request (by adding a label to the PR).

  const writeAccessOctokit = getOctokit(input.writeToken)

  log.info("Merging PR")
  await writeAccessOctokit.rest.pulls.merge({
    owner: githubContext.repo.owner,
    repo: githubContext.repo.repo,
    pull_number: prNumber,
    commit_title: prTitle,
    commit_message: "", // in the future, we can populate this with breaking changes.
    merge_method: "squash"
  })
  await writeAccessOctokit.rest.issues.removeLabel({
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
