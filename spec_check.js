import { Octokit } from "@octokit/rest";

// This token is probably expired.
// Create a new personal access token here: https://github.com/settings/tokens
// I used classic and only gave it the repo scope

const ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN
if(!ACCESS_TOKEN) {
    console.log("\n🌵🌵🌵 Please set the GITHUB_PERSONAL_ACCESS_TOKEN env var! 🌵🌵🌵\n")
    process.exit()
}

if(process.argv.length != 4) {
    console.log('\n🌵🌵🌵 Improper usage! Example: node spec_check.js grailed jordan-fallon-grailed 🌵🌵🌵\n')
    process.exit()
}

const REPO = process.argv[2]
const AUTHOR = process.argv[3]
const MAX_PAGES = 10
const PR_COUNT = 50
const PER_PAGE = 100
const TEST_FILE_PATTERN = /_spec.rb|test.[jt]s|Tests.swift/

const octokit = new Octokit({ auth: ACCESS_TOKEN })
let withTests = 0
const prNumbers = []

let keepGoing = true
let page = 1

while(keepGoing && page <= MAX_PAGES) {
    console.log(`Loading page ${page}...`)
    const pulls = await octokit.rest.pulls.list({
        owner: 'grailed-code',
        repo: REPO,
        state: 'closed',
        per_page: PER_PAGE,
        page
    })

    for (let pull of pulls.data) {
        if (pull.merged_at && pull.user.login == AUTHOR) prNumbers.push(pull.number)
    }
    if(prNumbers.length > PR_COUNT) keepGoing = false
    page++
}

for (let prNumber of prNumbers) {
    console.log(`Fetching files for PR #${prNumber}...`)
    const pull = await octokit.rest.pulls.listFiles({
        owner: 'grailed-code',
        repo: REPO,
        pull_number: prNumber
    })

    const altersTestFiles = pull.data
        .map(file => file.filename)
        .some(filename => filename.match(TEST_FILE_PATTERN)?.length > 0)

    if(altersTestFiles) withTests += 1
}

console.log(`For author ${AUTHOR}, ${withTests}/${prNumbers.length} or ${Math.round(withTests / prNumbers.length * 100)}% of latest PRs contain tests`)
