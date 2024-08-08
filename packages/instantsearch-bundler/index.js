import http from 'http';

import { buildSync } from 'esbuild';

http
  .createServer((req, res) => {
    const searchParams = new URLSearchParams(req.url.replace('/?', ''));

    const appId = searchParams.get('appId');
    const apiKey = searchParams.get('apiKey');

    if (!appId || !apiKey) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing appId or apiKey');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/javascript' });

    // This would be computed based on the configuration
    const mappedWidgets = ['searchBox', 'hits', 'pagination'];

    const script = `
import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { ${mappedWidgets.join(', ')} } from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch('${appId}', '${apiKey}');
const search = instantsearch({
  indexName: 'fx_hackathon_24_bm_products',
  searchClient,
  insights: true,
});

search.addWidgets([
  block({ container: '#block', widgets: [${mappedWidgets.join(', ')}] }),
]);

search.start();
`;

    const bundle = buildSync({
      bundle: true,
      write: false,
      stdin: { contents: script, resolveDir: '.' },
    });

    res.end(bundle.outputFiles[0].text);
  })
  .listen(3000);
