import startServer from '../functional-tests/startServer.js';
import watch from './dev-functional-tests-compile-watch.js';

watch(() => {});

startServer()
  .then(serverInstance => console.log('http://localhost:' + serverInstance.address().port))
  .catch((e) => setTimeout(function() {throw e;}, 0));
