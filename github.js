import { Octokit } from "@octokit/rest";

// This token is probably expired.
// Create a new personal access token here: https://github.com/settings/tokens
// I used classic and only gave it the repo scope
const ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN

if(!ACCESS_TOKEN) {
    console.log("\n🌵🌵🌵 Please set the GITHUB_PERSONAL_ACCESS_TOKEN env var! 🌵🌵🌵\n")
    process.exit()
}

const octokit = new Octokit({ auth: ACCESS_TOKEN })
const PER_PAGE = 100

export const fetchNextPageOfPRs = async (repo, page) => {
    console.log(`Loading page ${page}...`)
    const response = await octokit.rest.pulls.list({
        owner: 'grailed-code',
        repo,
        state: 'closed',
        per_page: PER_PAGE,
        page
    })
    return response.data
}

export const fetchPR = async (repo, prNumber) => {
    console.log(`Fetching PR #${prNumber}...`)
    const response = await octokit.rest.pulls.get({
        owner: 'grailed-code',
        repo,
        pull_number: prNumber
    })
    return response.data
}

export const fetchFilesFromPR = async (repo, prNumber) => {
    console.log(`Fetching files for PR #${prNumber}...`)
    const response = await octokit.rest.pulls.listFiles({
        owner: 'grailed-code',
        repo,
        pull_number: prNumber
    })
    return response.data
}
