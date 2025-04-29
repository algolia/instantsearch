import { getServerState } from 'react-instantsearch-hooks-server';

export async function getServerSideProps() {
  const serverState = await getServerState(<HomePage />);

  return {
    props: {
      serverState,
    },
  };
}

export async function getServerSideProps2() {
  const serverState = await getServerState(<HomePage />, {});

  return {
    props: {
      serverState,
    },
  };
}
