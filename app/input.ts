import { Input } from "./type/input"
import * as core from "@actions/core"

export const defaults: Input = {
  token: ""
}

export const getInput = (): Input => {
  return {
    token: core.getInput("token")
  }
}
