import { readFileSync } from "fs"
import path from "path"
import stringFormat from "string-format"

const getMessage = (
  args: object,
  relativeFilePath: string,
  footerArgs: FooterArgs = { includedFooterDropdownOpened: "" }
): string => {
  const fileString = stringFormat(
    readFileSync(path.join(__dirname, relativeFilePath), { encoding: "utf-8" }),
    args
  )
  const footerString = stringFormat(
    readFileSync(path.join(__dirname, "assets/footer.md"), { encoding: "utf-8" }),
    footerArgs
  )
  const combinedStrings = fileString + "\n\n" + footerString

  return stringFormat(combinedStrings, args)
}

interface FooterArgs {
  // If the footer markdown content should be expanded by default or not.
  includedFooterDropdownOpened: "open" | ""
}

export interface InvalidPrTitleTemplateArgs {
  author: string
}

export const getInvalidPrTitleHelp = (
  args: InvalidPrTitleTemplateArgs,
  options?: { filePath?: string }
): string => {
  const filePath = options?.filePath || "assets/invalid_pr_title_help.md"

  return getMessage(args, filePath, {
    includedFooterDropdownOpened: "open"
  })
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

  const isBreakingChange = args.nextReleaseType == "major"

  const templateArgs = {
    willCauseReleaseDescription: args.willCauseRelease ? "cause" : "not cause",
    isBreakingChangeDescription: isBreakingChange ? "is" : "is not",
    nextReleaseExample,
    ...args
  }

  return getMessage(templateArgs, filePath)
}

export interface CommitTypeNotAllowedTemplateArgs {
  author: string
  branchName: string
  allowedTypes: string[]
  givenType: string
}

export const getCommitTypeNotAllowedInBranchMessage = (
  args: CommitTypeNotAllowedTemplateArgs,
  options?: { filePath?: string }
): string => {
  const filePath = options?.filePath || "assets/commit_type_not_allowed_branch.md"

  return getMessage(args, filePath)
}
