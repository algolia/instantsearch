import connect from '../connectPoweredBy';

jest.mock('../../core/createConnector', () => x => x);

const { getProvidedProps } = connect;

let props;
describe('connectPoweredBy', () => {
  it('provides the correct props to the component', () => {
    props = getProvidedProps({ canRender: true });
    expect(props).toEqual({
      url:
        'https://www.algolia.com/?utm_source=react-instantsearch&utm_medium=website&utm_content=&utm_campaign=poweredby',
    });
  });
});
