import { fetchNextPageOfPRs, fetchPR } from "./github.js";

if(process.argv.length != 4) {
    console.log('\n🌵🌵🌵 Improper usage! Example: node index.js grailed "2023-02-01" 🌵🌵🌵\n')
    process.exit()
}

const REPO = process.argv[2]
const OLDEST_DATE = new Date(process.argv[3])
const MAX_PAGES = 10

const prNumbers = []
const diffs = []

let keepGoing = true
let page = 1

while(keepGoing && page <= MAX_PAGES) {
    const pulls = await fetchNextPageOfPRs(REPO, page)

    for (let pull of pulls) {
        if(new Date(pull.created_at) <= OLDEST_DATE) {
            keepGoing = false
            break
        }
        if (pull.merged_at) prNumbers.push(pull.number)
    }
    page++
}

for (let prNumber of prNumbers) {
    const pull = await fetchPR(REPO, prNumber)

    const diff = pull.additions - pull.deletions
    diffs.push(
        {
            url: `https://github.com/grailed-code/${REPO}/pull/${pull.number}`,
            deletions: diff
        }
    )
}

diffs.sort((a, b) => a.deletions - b.deletions)
console.log(diffs)
