// Standalone fake backend: `yarn server`.
// Not needed with `yarn dev:fake`, which mounts the same handler in Vite.

import { createServer } from 'node:http';

import { handler } from './handler.mjs';

const port = Number(process.env.PORT || 3001);

createServer((req, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', 'content-type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  handler(req, res);
}).listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Fake agentic search backend on http://localhost:${port}`);
});
