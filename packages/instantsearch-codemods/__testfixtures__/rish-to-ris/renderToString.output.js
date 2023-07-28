import { getServerState } from 'react-instantsearch';
import { renderToString } from 'react-dom/server';

export async function getServerSideProps() {
  const serverState = await getServerState(<HomePage />, {
    renderToString
  });

  return {
    props: {
      serverState,
    },
  };
}

export async function getServerSideProps2() {
  const serverState = await getServerState(<HomePage />, {
    renderToString
  });

  return {
    props: {
      serverState,
    },
  };
}
