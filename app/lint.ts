import lint from "@commitlint/lint"
import { LintOptions, ParserOptions, QualifiedConfig } from "@commitlint/types"
import load from "@commitlint/load"
import * as log from "./log"
import { ReleaseType } from "./type/release_type"
import commitAnalyzer from "@semantic-release/commit-analyzer"
import conventionalCommitsPreset from "conventional-changelog-conventionalcommits"
import parser from "conventional-commits-parser"
import { Commit } from "conventional-commits-parser"
import commitLintConventionalConfig from "@commitlint/config-conventional"

export const lintPrTitle = async (title: string): Promise<boolean> => {
  title = title.trim()
  const rulesName = "@commitlint/config-conventional"

  if (title == "") return false

  log.debug(`Linting PR ${title} with rules: ${rulesName}`)

  // Using load() to get more accurate rules sets such as ! for breaking changes.
  // https://github.com/conventional-changelog/commitlint/issues/2226#issuecomment-777207848
  let loadedRules: QualifiedConfig | undefined
  try {
    // load throws if can't find the rules to load
    loadedRules = await load({
      extends: [rulesName]
    })
  } catch {
    return false
  }

  if (!loadedRules || !loadedRules.parserPreset) {
    log.error(`Rules set ${rulesName} not able to be loaded. Not able to lint PR title without it.`)
    return false
  }
  const preset = await conventionalCommitsPreset()
  const opts: LintOptions = {
    parserOpts: preset.parserOpts as ParserOptions
  }
  const lintResult = await lint(title, commitLintConventionalConfig.rules, opts)

  log.debug(`Linting result: ${JSON.stringify(lintResult)}`)

  return lintResult.valid
}

export const getNextReleaseType = async (prTitle: string): Promise<ReleaseType> => {
  const result: ReleaseType = await commitAnalyzer.analyzeCommits(
    {
      preset: "conventionalcommits"
    },
    {
      commits: [{ message: prTitle, hash: "XXX" }],
      logger: console
    }
  )

  return result
}

export const parseTitle = async (prTitle: string): Promise<Commit> => {
  const preset = await conventionalCommitsPreset()
  const rules = preset.parserOpts

  return parser.sync(prTitle, rules)
}
