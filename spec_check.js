import { fetchNextPageOfPRs, fetchFilesFromPR } from "./github.js"

if(process.argv.length != 4) {
    console.log('\n🌵🌵🌵 Improper usage! Example: node spec_check.js grailed jordan-fallon-grailed 🌵🌵🌵\n')
    process.exit()
}

const REPO = process.argv[2]
const AUTHOR = process.argv[3]
const MAX_PAGES = 10
const PR_COUNT = 50
const TEST_FILE_PATTERN = /_spec.rb|test.[jt]s|Tests.swift/

let withTests = 0
const prNumbers = []

let keepGoing = true
let page = 1

while(keepGoing && page <= MAX_PAGES) {
    const pulls = await fetchNextPageOfPRs(REPO, page)

    for (let pull of pulls) {
        if (pull.merged_at && pull.user.login == AUTHOR) prNumbers.push(pull.number)
    }
    if(prNumbers.length > PR_COUNT) keepGoing = false
    page++
}

for (let prNumber of prNumbers) {
    const prFiles = await fetchFilesFromPR(REPO, prNumber)

    const altersTestFiles = prFiles
        .map(file => file.filename)
        .some(filename => filename.match(TEST_FILE_PATTERN)?.length > 0)

    if(altersTestFiles) withTests += 1
}

console.log(`For author ${AUTHOR}, ${withTests}/${prNumbers.length} or ${Math.round(withTests / prNumbers.length * 100)}% of latest PRs contain tests`)
