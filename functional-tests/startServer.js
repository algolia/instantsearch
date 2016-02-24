import compression from 'compression';
import express from 'express';
import path from 'path';

export default () => {
  return new Promise((resolve, reject) => {
    let app = express();
    app.use(compression());

    // in npm run test:functional:dev mode we only watch and compile instantsearch.js
    if (process.env.CI !== 'true') {
      app.use((req, res, next) => {
        if (req.path === '/instantsearch.min.js') {
          res.redirect('/instantsearch.js');
          return;
        }

        next();
      });
    }

    app.use(express.static(path.join(__dirname, 'app')));
    app.use(express.static(path.join(__dirname, '..', 'dist')));
    let server = app.listen(process.env.PORT || 9000);

    server.once('listening', () => resolve(server));
    server.once('error', reject);
  });
};
