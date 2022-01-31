import lint from "@commitlint/lint"
import { LintOptions, ParserOptions, QualifiedRules } from "@commitlint/types"
import * as log from "./log"
import { ReleaseType } from "./type/release_type"
import parser from "conventional-commits-parser"
import { Commit, Options } from "conventional-commits-parser"
import commitLintConventionalConfig from "@commitlint/config-conventional"
import conventionCommitsSpec from "conventional-changelog-conventionalcommits"

interface Spec {
  rules: QualifiedRules
  parserOpts: Options
  whatBump: Function
}

const getSpec = async (type: string): Promise<Spec> => {
  if (type == "conventionalcommits") {
    const spec = await conventionCommitsSpec()
    return {
      rules: commitLintConventionalConfig.rules,
      parserOpts: spec.parserOpts,
      whatBump: spec.recommendedBumpOpts.whatBump
    }
    // } else if (type == "angular") {
    //   const angular = await presetLoader("angular")
    //   return {
    //     parserOpts: angular.parserOpts,
    //     whatBump: angular.recommendedBumpOpts.whatBump
    //   }
  } else {
    throw Error("type unknown")
  }
}

export const lintPrTitle = async (title: string): Promise<boolean> => {
  title = title.trim()
  const rulesName = "@commitlint/config-conventional"

  if (title == "") return false

  log.debug(`Linting PR ${title} with rules: ${rulesName}`)

  const preset = await getSpec("conventionalcommits")
  const opts: LintOptions = {
    parserOpts: preset.parserOpts as ParserOptions
  }
  const lintResult = await lint(title, preset.rules, opts)

  log.debug(`Linting result: ${JSON.stringify(lintResult)}`)

  return lintResult.valid
}

export const parseTitle = async (prTitle: string): Promise<Commit> => {
  // for angular, it's more simple:
  // require("conventional-changelog-angular")
  // configuration = (await conventionalChangelogPresetLoader(`angular`)).parserOpts
  // it just all depends on what is exported by the index.s for each module
  const preset = await getSpec("conventionalcommits")
  const rules = preset.parserOpts

  return parser.sync(prTitle, rules)
}

export const getNextReleaseType = async (prTitle: string): Promise<ReleaseType> => {
  const preset = await getSpec("conventionalcommits")
  const bump = preset.whatBump

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
