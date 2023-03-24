import http from 'node:http';
import { JSDOM, ResourceLoader } from 'jsdom';
import { readFile } from 'node:fs/promises';

import {
  getInitialResults,
  waitForResults,
} from 'instantsearch.js/es/lib/server.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import instantsearch from 'instantsearch.js/dist/instantsearch.development.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import algoliasearch from 'algoliasearch/dist/algoliasearch-lite.esm.browser.mjs';

class CustomResourceLoader extends ResourceLoader {
  fetch(url, options) {
    if (options.element.name === 'HTMLLinkElement') {
      return Promise.resolve(Buffer.from(''));
    }

    return super.fetch(url, options);
  }
}

http
  .createServer(async (req, res) => {
    const clientURL = new URL(
      req.url,
      'http://localhost:3000'
    ).searchParams.get('url');

    const { window } = new JSDOM(
      await readFile(
        new URL('./instantsearch-code.html', import.meta.url),
        'utf-8'
      ),
      {
        url: new URL(clientURL, 'http://localhost:3000'),
        resources: new CustomResourceLoader(),
        runScripts: 'dangerously',
      }
    );

    await new Promise((resolve) => {
      window.addEventListener('load', resolve);
    });

    window.setTimeout = setTimeout;
    window.setInterval = setInterval;

    Object.assign(global, window, {
      window,
      // @TODO: how to add all global window properties?
      HTMLElement: window.HTMLElement,
      XMLHttpRequest: window.XMLHttpRequest,
    });

    const code = await readFile(
      new URL('./instantsearch-code.js', import.meta.url),
      'utf-8'
    );

    const { search } = createDOM(code);

    search._initialResults = {};
    search.start();
    search.sendEventToInsights = () => {};

    await waitForResults(search);
    const initialResults = getInitialResults(search.mainIndex);
    search.mainIndex.render({
      instantSearchInstance: search,
    });

    const templates = Object.fromEntries(
      Array.from(document.querySelectorAll('x-template')).map((template) => [
        template.id,
        template.innerHTML,
      ])
    );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify(
        {
          templates,
          resources: {
            scripts: `
            <script src="https://cdn.jsdelivr.net/npm/instantsearch.js@4.53.0/dist/instantsearch.production.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/algoliasearch@4.15.0/dist/algoliasearch.umd.min.js"></script>
            <script>
              ${code};
              search._initialResults = ${JSON.stringify(initialResults)};
              search.start();
            </script>
          `,
          },
        },
        null,
        2
      )
    );
  })
  .listen(3000);

function createDOM(code) {
  window.search = undefined;

  // eslint-disable-next-line no-eval
  eval(code);

  return { search: window.search };
}
