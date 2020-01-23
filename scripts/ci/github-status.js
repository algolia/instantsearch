#!/usr/bin/env node
const argv = require('yargs').argv;
const Octokit = require('@octokit/rest');

const octokit = Octokit({
  auth: process.env.GITHUB_TOKEN,
});

octokit.repos.createStatus({
  owner: process.env.CIRCLE_PROJECT_USERNAME,
  repo: process.env.CIRCLE_PROJECT_REPONAME,
  sha: process.env.CIRCLE_SHA1,
  state: argv.state || 'success',
  target_url: argv.target_url || process.env.CIRCLE_BUILD_URL,
  description: argv.description || 'Your tests passed on CircleCI! ',
  context: argv.context || `ci/circleci: ${process.env.CIRCLE_JOB}`,
});
