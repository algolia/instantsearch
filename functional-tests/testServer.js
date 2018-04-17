import compression from 'compression';
import express from 'express';
import path from 'path';

let server;

const loadNonMinified = () => (req, res, next) => {
  const buildType = /^\/(.*)?\.min\.js$/;
  const minifiedJavaScriptMatch = buildType.exec(req.path);

  if (minifiedJavaScriptMatch) {
    res.redirect(`${minifiedJavaScriptMatch[1]}.js`);
    return;
  }

  next();
};

export default {
  start: () =>
    new Promise((resolve, reject) => {
      const app = express();
      app.use(compression());

      // in yarn run test:functional:dev mode we only watch and compile instantsearch.js
      if (process.env.CI !== 'true') {
        app.use(loadNonMinified());
      }

      app.use(express.static(path.join(__dirname, 'app')));
      app.use(express.static(path.join(__dirname, '..', 'dist')));
      server = app.listen(process.env.PORT || 9000);

      server.once('listening', () => resolve(server));
      server.once('error', reject);
    }),
  stop: () => {
    server.close();
  },
};
