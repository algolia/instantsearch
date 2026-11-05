// Saves the agentic trigger rules (server/rules.mjs) on the real index.
//
//   ALGOLIA_ADMIN_API_KEY=… node scripts/setup-rules.mjs
//
// Needs a key with the editSettings ACL. The key is only read from the
// environment, never stored. The rules only fire for searches that send the
// POC's rule contexts, so other users of the index are unaffected.

import { buildRules } from '../server/rules.mjs';

const appId = process.env.ALGOLIA_APP_ID || 'latency';
const indexName = process.env.ALGOLIA_INDEX_NAME || 'instant_search';
const agentId =
  process.env.ALGOLIA_AGENT_ID || '84e907c0-1046-48c6-8dd8-559d40527fc6';
const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;

if (!apiKey) {
  // eslint-disable-next-line no-console
  console.error('Set ALGOLIA_ADMIN_API_KEY (editSettings ACL).');
  process.exit(1);
}

const rules = buildRules({ agentId });

fetch(`https://${appId}.algolia.net/1/indexes/${indexName}/rules/batch`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-algolia-application-id': appId,
    'x-algolia-api-key': apiKey,
  },
  body: JSON.stringify(rules),
})
  .then((response) =>
    response.json().then((body) => {
      if (!response.ok) throw new Error(body.message || response.status);
      // eslint-disable-next-line no-console
      console.log(
        `Saved ${rules.map((rule) => rule.objectID).join(', ')} on ${appId}/${indexName} (task ${body.taskID}).`
      );
    })
  )
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error.message || error);
    process.exit(1);
  });
