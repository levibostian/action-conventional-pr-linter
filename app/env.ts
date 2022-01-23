import core, { ExitCode } from "@actions/core"
import { exit } from "process"

export const terminate = (failure?: string | Error): void => {
  if (failure) {
    core.setFailed(failure)
  } else {
    exit(ExitCode.Success)
  }
}
