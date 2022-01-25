import { readFileSync } from "fs"
import path from "path"
import stringFormat from "string-format"

const getMessage = (author: string, relativeFilePath: string): string => {
  const fileTemplate = readFileSync(path.join(__dirname, relativeFilePath), { encoding: "utf-8" })

  return stringFormat(fileTemplate, {
    author: author
  })
}

export const getInvalidPrTitleHelp = (author: string, options?: { filePath?: string }): string => {
  const filePath = options?.filePath || "assets/invalid_pr_title_help.md"

  return getMessage(author, filePath)
}

export const getValidPrTitleMessage = (author: string, options?: { filePath?: string }): string => {
  const filePath = options?.filePath || "assets/valid_pr_title.md"

  return getMessage(author, filePath)
}
