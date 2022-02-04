import { Input } from "./type/input"
import * as core from "@actions/core"

export const getInput = (): Input => {
  const rawInput: Input = {
    readToken: core.getInput("readToken"),
    writeToken: core.getInput("writeToken"),
    branchTypeWarning: JSON.parse(core.getInput("branchTypeWarning"))
  }

  const branchTypeWarningObject: { [key: string]: unknown } = rawInput.branchTypeWarning || {}

  // Try to filter out keys of object where value is not a string
  rawInput.branchTypeWarning = Object.fromEntries(
    Object.entries(branchTypeWarningObject).filter(
      ([key]) => typeof branchTypeWarningObject[key] == "string"
    )
  ) as { [key: string]: string }

  return rawInput
}
