/* eslint-disable no-console */
import testServer from '../../functional-tests/testServer';
import watch from './compile-watch';

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
