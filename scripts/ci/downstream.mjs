#!/usr/bin/env node
// @ts-check
/* eslint-disable no-console */

const [, , project] = process.argv;
const { CIRCLE_USER_TOKEN } = process.env;

if (!project || !CIRCLE_USER_TOKEN) {
  throw new Error('Missing project (argument) or token ($CIRCLE_USER_TOKEN)');
}

console.log('node', project, CIRCLE_USER_TOKEN);

const pipeline = await fetch(
  `https://circleci.com/api/v2/project/github/${project}/pipeline`,
  {
    method: 'POST',
    body: JSON.stringify({
      branch: 'master',
      parameters: {
        // TODO: this should be a way to install instantsearch.js, possibly via codesandbox?
        instantsearch_url: '4.30.0',
      },
    }),
    headers: {
      'content-type': 'application/json',
      Accept: 'application/json',
      'Circle-Token': CIRCLE_USER_TOKEN,
    },
  }
).then((res) => res.json());

console.log('triggered pipeline', pipeline);

await wait(1000);

// TODO: exponential backoff retrying the status until it's ok

const pipelineStatus = await fetch(
  `https://circleci.com/api/v2/project/github/${project}/pipeline/${pipeline.number}`,
  {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      Accept: 'application/json',
      'Circle-Token': CIRCLE_USER_TOKEN,
    },
  }
).then((res) => res.json());

console.log('pipelineStatus', pipelineStatus);

// TODO: backoff until status is finished, then list the state in the status

const workflowStatus = await fetch(
  `https://circleci.com/api/v2/project/github/${project}/pipeline/${pipeline.number}/workflow`,
  {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      Accept: 'application/json',
      'Circle-Token': CIRCLE_USER_TOKEN,
    },
  }
).then((res) => res.json());

console.log('workflowStatus', workflowStatus);

export {};

/**
 * @param {number} ms number of milliseconds to wait
 * @returns {Promise<void>} resolves when timer finishes
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
