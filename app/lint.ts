import lint from "@commitlint/lint"
import { QualifiedRules } from "@commitlint/types"
import angularRules from "@commitlint/config-angular"
import conventionalRules from "@commitlint/config-conventional"

export const lintPrTitle = async (title: string, rules: string): Promise<boolean> => {
  let rulesSet: QualifiedRules | undefined = undefined

  if (rules == "angular") {
    rulesSet = angularRules.rules
  }
  if (rules == "conventional") {
    rulesSet = conventionalRules.rules
  }

  if (rulesSet == undefined) {
    return false
  }

  const lintResult = await lint(title, rulesSet)

  return lintResult.valid
}
