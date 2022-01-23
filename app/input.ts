import { Input } from "./type/input"
import * as core from "@actions/core"

export const getInput = (): Input => {
  return {
    rules: core.getInput("rules"),
    token: core.getInput("token")
  }
}

export const validateInput = (input: Input): Error | null => {
  const validRulesSets = ["angular", "conventional"]

  if (!validRulesSets.includes(input.rules)) {
    return new Error(`Rules needs to be one of: ${validRulesSets}. Given: ${input.rules}.`)
  }

  return null
}
