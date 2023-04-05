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
    console.log('\n🌵🌵🌵 Improper usage! Example: node index.js grailed "2023-02-01" 🌵🌵🌵\n')
    process.exit()
}

const REPO = process.argv[2]
const OLDEST_DATE = new Date(process.argv[3])
const MAX_PAGES = 10
const PER_PAGE = 100

const octokit = new Octokit({ auth: ACCESS_TOKEN })
const diffs = []
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

    const prNumbers = []
    for (let pull of pulls.data) {
        if(new Date(pull.created_at) <= OLDEST_DATE) {
            keepGoing = false
            break
        }
        if (pull.merged_at) prNumbers.push(pull.number)
    }

    for (let prNumber of prNumbers) {
        const pull = await octokit.rest.pulls.get({
            owner: 'grailed-code',
            repo: REPO,
            pull_number: prNumber
        })

        const diff = pull.data.additions - pull.data.deletions
        diffs.push(
            {
                url: `https://github.com/grailed-code/${REPO}/pull/${pull.data.number}`,
                deletions: diff
            }
        )
    }
    page++
}

diffs.sort((a, b) => a.deletions - b.deletions)
console.log(diffs)
