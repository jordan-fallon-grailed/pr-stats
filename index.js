import { Octokit } from "@octokit/rest";

// This token is probably expired.
// Create a new personal access token here: https://github.com/settings/tokens
// I used classic and only gave it the repo scope
const octokit = new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN })


const STOP_DATE = new Date('2022-08-31')
const MAX_PAGES = 10
const PER_PAGE = 100
const REPO = 'grailed-ios'


const diffs = []
let dontStop = true
let page = 1

while(dontStop && page <= MAX_PAGES) {
    console.log(`Loading page ${page}...`)
    const pulls = await octokit.rest.pulls.list({
        owner: 'grailed-code',
        REPO,
        state: 'all',
        per_page: PER_PAGE,
        page
    })

    const prNumbers = []
    for (let pull of pulls.data) {
        if(new Date(pull.created_at) <= STOP_DATE) {
            dontStop = false
            break
        }
        prNumbers.push(pull.number)
    }

    for (let prNumber of prNumbers) {
        const pull = await octokit.rest.pulls.get({
            owner: 'grailed-code',
            REPO,
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
