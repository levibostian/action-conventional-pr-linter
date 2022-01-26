import { readFileSync } from "fs"
import path from "path"
import stringFormat from "string-format"

const getMessage = (args: object, relativeFilePath: string): string => {
  const fileTemplate = readFileSync(path.join(__dirname, relativeFilePath), { encoding: "utf-8" })

  return stringFormat(fileTemplate, args)
}

export interface InvalidPrTitleTemplateArgs {
  author: string
}

export const getInvalidPrTitleHelp = (
  args: InvalidPrTitleTemplateArgs,
  options?: { filePath?: string }
): string => {
  const filePath = options?.filePath || "assets/invalid_pr_title_help.md"

  return getMessage(args, filePath)
}

export interface ValidPrTitleTemplateArgs {
  author: string
  willCauseRelease: boolean
  nextReleaseType?: "major" | "minor" | "patch"
}

export const getValidPrTitleMessage = (
  args: ValidPrTitleTemplateArgs,
  options?: { filePath?: string }
): string => {
  const filePath = options?.filePath || "assets/valid_pr_title.md"

  let nextReleaseExample = "1.0.0"
  if (args.nextReleaseType == "major") nextReleaseExample = "2.0.0"
  else if (args.nextReleaseType == "minor") nextReleaseExample = "1.1.0"
  else if (args.nextReleaseType == "patch") nextReleaseExample = "1.0.1"

  const templateArgs = {
    willCauseReleaseDescription: args.willCauseRelease ? "cause" : "not cause",
    nextReleaseExample,
    ...args
  }

  return getMessage(templateArgs, filePath)
}
