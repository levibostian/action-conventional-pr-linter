import lint from "@commitlint/lint"
import { LintOptions, ParserOptions } from "@commitlint/types"
import * as log from "./log"
import { ReleaseType } from "./type/release_type"
import commitAnalyzer from "@semantic-release/commit-analyzer"
import parser from "conventional-commits-parser"
import { Commit } from "conventional-commits-parser"
import commitLintConventionalConfig from "@commitlint/config-conventional"
import presetLoader from "conventional-changelog-preset-loader"

// import or it will not be bundled in compile js file
import "conventional-changelog-conventionalcommits"

export const lintPrTitle = async (title: string): Promise<boolean> => {
  title = title.trim()
  const rulesName = "@commitlint/config-conventional"

  if (title == "") return false

  log.debug(`Linting PR ${title} with rules: ${rulesName}`)

  // In the past, I have used @commitlint/load to load rules + parserPresets
  // but was not able to get it working when using ncc.
  // https://github.com/levibostian/action-semantic-pr/blob/a2d16f81b2634c08c43a19d4dc92ad9c3a243d92/app/lint.ts#L19-L38
  const preset = await presetLoader("conventionalcommits")
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
  const preset = await presetLoader("conventionalcommits")
  const rules = preset.parserOpts

  return parser.sync(prTitle, rules)
}
