import { renderToString } from '@vue/server-renderer';
import { createApp } from './app';

export async function render({ url }) {
  const { app, router, getResultsState } = createApp({ context: { url } });

  // set the router to the desired URL before rendering
  router.push(url);
  await router.isReady();

  const appContent = await renderToString(app);
  const algoliaStateScript = `<script>window.__ALGOLIA_STATE__ = ${JSON.stringify(
    getResultsState()
  )}</script>`;

  const html = `${appContent}${algoliaStateScript}`;
  return { html };
}
