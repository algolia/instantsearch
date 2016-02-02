import server from '../functional-tests/server';

server()
  .then(() => console.log('http://localhost:9000'))
  .catch((e) => setTimeout(function() {throw e;}, 0));
