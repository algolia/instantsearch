/* eslint-disable no-console */
import testServer from '../functional-tests/testServer.js';
import watch from './dev-functional-tests-compile-watch.js';

watch(() => {});

testServer
  .start()
  .then(serverInstance =>
    console.log(`http://localhost:${serverInstance.address().port}`)
  )
  .catch(e =>
    setTimeout(() => {
      throw e;
    }, 0)
  );
