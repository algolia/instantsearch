import { join } from 'path';

import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getServerState } from 'react-instantsearch';

import App from './App';
import { requestsCache } from './searchClient';

const app = express();

app.use('/assets', express.static(join(__dirname, 'assets')));

app.get('/', async (req, res) => {
  const location = new URL(
    `${req.protocol}://${req.get('host')}${req.originalUrl}`
  );
  const serverState = await getServerState(<App location={location} />, {
    renderToString,
  });
  requestsCache.clear();
  const html = renderToString(
    <App serverState={serverState} location={location} />
  );

  res.send(
    `<!DOCTYPE html>
<html>
  <head>
    <title>React InstantSearch SSR</title>
    <link href="https://cdn.jsdelivr.net/npm/instantsearch.css@8/themes/satellite-min.css" rel="stylesheet" />
    <script>window.__SERVER_STATE__ = ${JSON.stringify(serverState)}</script>
  </head>

  <body>
    <div id="root">${html}</div>
  </body>

  <script src="/assets/bundle.js"></script>
</html>`
  );
});

app.listen(8080, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on: http://localhost:8080');
});
