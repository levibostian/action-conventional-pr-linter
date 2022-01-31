import * as lint from "./lint"

describe("lintPrTitle", () => {
  it(`given empty string, expect false`, async () => {
    expect(await lint.lintPrTitle("")).toEqual(false)
  })
  it(`given invalid title, expect false`, async () => {
    expect(await lint.lintPrTitle("foo: bar")).toEqual(false)
  })
  it(`given valid title, expect true`, async () => {
    expect(await lint.lintPrTitle("feat: bar")).toEqual(true)
  })
  it(`given breaking change conventional title, expect true`, async () => {
    expect(await lint.lintPrTitle("feat!: bar")).toEqual(true)
  })
})

describe("getNextReleaseType", () => {
  it(`given no bump, expect undefined`, async () => {
    expect(await lint.getNextReleaseType("ci: bar")).toEqual(undefined)
  })
  it(`given patch type, expect undefined`, async () => {
    expect(await lint.getNextReleaseType("fix: bar")).toEqual("patch")
  })
  it(`given feat, expect minor`, async () => {
    expect(await lint.getNextReleaseType("feat: bar")).toEqual("minor")
  })
  it(`given breaking change conventional title, expect major`, async () => {
    expect(await lint.getNextReleaseType("feat!: bar")).toEqual("major")
  })
})
