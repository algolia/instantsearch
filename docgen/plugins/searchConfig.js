import {forEach} from 'lodash';

// Injects search config from the frontmatter Markdown page to the `window` object.
// This allows to run code snippets in any Algolia index.
export default function() {
  return function(files, metalsmith, done) {
    forEach(files, (data, path) => {
      const {appId, apiKey, indexName} = data;

      if (appId || apiKey || indexName) {
        data.contents =
          data.contents +
          `<script>
            window.searchConfig = {
              ${appId ? `appId: '${appId}',` : ''}
              ${apiKey ? `apiKey: '${apiKey}',` : ''}
              ${indexName ? `indexName: '${indexName}',` : ''}
            };
          </script>`
          .replace(/\s/g, '');
      }
    });

    done();
  };
}
