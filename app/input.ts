import { Input } from "./type/input"
import * as core from "@actions/core"

export const defaults: Input = {
  rules: "@commitlint/config-conventional",
  token: "",
  invalidPrTitleMessagePath: undefined
}

export const getInput = (): Input => {
  return {
    rules: core.getInput("rules"),
    token: core.getInput("token"),
    invalidPrTitleMessagePath: core.getInput("invalidPrTitleMessagePath")
  }
}
