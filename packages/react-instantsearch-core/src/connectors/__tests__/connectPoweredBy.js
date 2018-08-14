import connect from '../connectPoweredBy';

jest.mock('../../core/createConnector', () => x => x);

describe('connectPoweredBy', () => {
  const { getProvidedProps } = connect;

  it('provides the correct props to the component', () => {
    const props = getProvidedProps({ canRender: true });

    expect(props).toEqual({
      url:
        'https://www.algolia.com/?utm_source=react-instantsearch&utm_medium=website&utm_content=localhost&utm_campaign=poweredby',
    });
  });
});
