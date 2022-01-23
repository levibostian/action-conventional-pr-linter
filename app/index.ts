import { getInput, validateInput } from "./input"
import { lintPrTitle } from "./lint"
import { context as githubContext, getOctokit } from "@actions/github"
import { terminate } from "./env"
import * as log from "./log"
;(async () => {
  if (githubContext.eventName != "pull_request") {
    log.info(
      "GitHub Action workflow trigger is not a pull_request. Nothing for me to do. I'll just exit."
    )
    return terminate()
  }

  const input = getInput()
  const inputError = validateInput(input)
  if (inputError) {
    return terminate(inputError)
  }

  const prNumber = githubContext.payload.pull_request?.number
  if (!prNumber) {
    log.info(
      "GitHub Action must not have triggered by a pull_request because I cannot find a pull request number. Nothing for me to do. I'll just exit."
    )
    return terminate()
  }

  const octokit = getOctokit(input.token)
  const pullRequest = await octokit.rest.pulls.get({
    owner: githubContext.repo.owner,
    repo: githubContext.repo.repo,
    pull_number: prNumber
  })

  const prTitle = pullRequest.data.title

  const isTitleValid = await lintPrTitle(prTitle, input.rules)
  if (!isTitleValid) {
    return terminate(new Error("PR title is not valid."))
  }

  log.info("Looks like the PR title is valid!")
  terminate()
})()

// const output: Output = {
//   text: getOutputText(input.text)
// }

// setOutput(output)
