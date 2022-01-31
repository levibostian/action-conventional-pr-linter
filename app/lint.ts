import lint from "@commitlint/lint"
import { LintOptions, ParserOptions } from "@commitlint/types"
import * as log from "./log"
import { ReleaseType } from "./type/release_type"
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
  const preset = await (await presetLoader("conventionalcommits"))()
  const opts: LintOptions = {
    parserOpts: preset.parserOpts as ParserOptions
  }
  const lintResult = await lint(title, commitLintConventionalConfig.rules, opts)

  log.debug(`Linting result: ${JSON.stringify(lintResult)}`)

  return lintResult.valid
}

export const parseTitle = async (prTitle: string): Promise<Commit> => {
  // for angular, it's more simple:
  // require("conventional-changelog-angular")
  // configuration = (await conventionalChangelogPresetLoader(`angular`)).parserOpts
  // it just all depends on what is exported by the index.s for each module
  const preset = await (await presetLoader("conventionalcommits"))()
  const rules = preset.parserOpts

  return parser.sync(prTitle, rules)
}

export const getNextReleaseType = async (prTitle: string): Promise<ReleaseType> => {
  const preset = await (await presetLoader("conventionalcommits"))()
  const bump = preset.recommendedBumpOpts.whatBump

  const VERSIONS = ["major", "minor", "patch"]
  // copied default rules for semantic-release. https://github.com/semantic-release/commit-analyzer/blob/16ea0f7389468bda69fefaf124310088ec746f0a/lib/default-release-rules.js
  // in future, would be nice to have this config passed in or load from semantic-release
  const releaseRules = [
    { type: "feat", release: "minor" },
    { type: "fix", release: "patch" },
    { type: "perf", release: "patch" }
  ]

  const commit = await parseTitle(prTitle)

  const result = bump([commit])
  if (!result) return undefined

  const recommendedLevel = VERSIONS[result.level]
  if (recommendedLevel == "major") return recommendedLevel

  // by default, bump() will return 'major' for feature and anything else is a patch.
  // this might not match that of what's configured in your semantic release config.

  let matched: ReleaseType = undefined
  releaseRules.forEach((rule) => {
    if (!matched && rule.type == commit.type) {
      matched = rule.release as ReleaseType
    }
  })

  return matched
}
