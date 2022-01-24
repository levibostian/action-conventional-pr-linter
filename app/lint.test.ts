import * as lint from "./lint"
import { defaults } from "./input"

describe("lintPrTitle", () => {
  it(`given empty string, expect false`, async () => {
    expect(await lint.lintPrTitle("", defaults.rules)).toEqual(false)
  })
  it(`given empty rules set, expect false`, async () => {
    expect(await lint.lintPrTitle("feat: foo", "")).toEqual(false)
  })
  it(`given invalid rules set, expect false`, async () => {
    expect(await lint.lintPrTitle("feat: foo", "@commitlint/invalid-config")).toEqual(false)
  })
  it(`given invalid title, expect false`, async () => {
    expect(await lint.lintPrTitle("foo: bar", defaults.rules)).toEqual(false)
  })
  it(`given valid title, expect true`, async () => {
    expect(await lint.lintPrTitle("feat: bar", defaults.rules)).toEqual(true)
  })
  it(`given breaking change conventional title, expect true`, async () => {
    expect(await lint.lintPrTitle("feat!: bar", defaults.rules)).toEqual(true)
  })
})
