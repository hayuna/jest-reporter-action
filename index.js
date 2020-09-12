const core = require("@actions/core");
const { execSync } = require("child_process");
const { GitHub, context } = require("@actions/github");

const main = async () => {
  const githubClient = new GitHub(core.getInput("github-token"));

  const codeCoverage = execSync(core.getInput("test-command") || "npx jest").toString();
  const regex = /.*(File.* \|)/gs;
  const content = regex.exec(codeCoverage)[1];
  let coveragePercentage = execSync(
    "npx coverage-percentage ./coverage/lcov.info --lcov"
  ).toString();
  coveragePercentage = parseFloat(coveragePercentage).toFixed(2);

  const commentBody = `<p>Total Coverage: <code>${coveragePercentage}</code></p>
<details><summary>Coverage report</summary>
<p>
${content}
</p>
</details>`;

  await githubClient.issues.createComment({
    repo: context.repo.repo,
    owner: context.repo.owner,
    body: commentBody,
    issue_number: context.payload.number,
  });
};

main().catch(err => core.setFailed(err.message));
