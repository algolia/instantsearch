import { createApp } from './main';

export default context =>
  new Promise(async (resolve, reject) => {
    const { app, router, instantsearch } = await createApp();

    router.push(context.url);

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();

      if (!matchedComponents.length) {
        return reject({ code: 404 });
      }

      Promise.all(
        matchedComponents.map(Component => {
          if (Component.asyncData) {
            return Component.asyncData({
              instantsearch,
              route: router.currentRoute,
            });
          }
        })
      )
        .then(() => {
          // After all preFetch hooks are resolved, our store is now
          // filled with the state needed to render the app.
          // When we attach the state to the context, and the `template` option
          // is used for the renderer, the state will automatically be
          // serialized and injected into the HTML as `window.__INITIAL_STATE__`.
          context.algoliaState = instantsearch.getState();

          resolve(app);
        })
        .catch(reject);
    }, reject);
  });
