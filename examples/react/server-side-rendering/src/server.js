import { join } from 'path';

import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { findResultsState } from 'react-instantsearch-dom/server';

import { createApp } from './createApp';
import template from './template';

const server = express();

server.use('/assets', express.static(join(__dirname, 'assets')));

server.get('/', async (_, res) => {
  const { App, props } = createApp();

  const searchState = {
    query: 'iPhone',
    page: 5,
    refinementList: {
      brand: ['Apple'],
    },
  };

  const resultsState = await findResultsState(App, {
    ...props,
    searchState,
  });

  const initialState = {
    searchState,
    resultsState,
  };

  const plainHTML = renderToString(<App {...props} {...initialState} />);

  res.send(
    template({
      body: plainHTML,
      title: 'Hello World from the server',
      initialState: JSON.stringify(initialState),
    })
  );
});

server.listen(8080, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on: http://localhost:8080');
});
