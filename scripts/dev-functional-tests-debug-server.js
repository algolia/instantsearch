import startServer from '../functional-tests/startServer.js';

startServer()
  .then(serverInstance => console.log('http://localhost:' + serverInstance.address().port))
  .catch((e) => setTimeout(function() {throw e;}, 0));
