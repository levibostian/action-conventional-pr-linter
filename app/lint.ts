import lint from "@commitlint/lint"
import { QualifiedRules } from "@commitlint/types"
import angularRules from "@commitlint/config-angular"
import conventionalRules from "@commitlint/config-conventional"
import * as log from "./log"

export const lintPrTitle = async (title: string, rules: string): Promise<boolean> => {
  let rulesSet: QualifiedRules | undefined = undefined

  if (rules == "angular") {
    log.debug("Using angular rules for linting")
    rulesSet = angularRules.rules
  }
  if (rules == "conventional") {
    log.debug("Using conventional rules for linting")
    rulesSet = conventionalRules.rules
  }

  if (rulesSet == undefined) {
    log.debug(`Looks like rules set not defined or invalid. Given ${rules}`)
    return false
  }

  const lintResult = await lint(title, rulesSet)
  log.debug(`Linting result: ${JSON.stringify(lintResult)}`)

  return lintResult.valid
}
