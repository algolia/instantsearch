import { render } from 'preact';
import stats from '../stats';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

const instantSearchInstance = { templatesConfig: undefined };

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      stats({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/stats/js/"
`);
  });
});

describe('stats()', () => {
  let container;
  let widget;

  beforeEach(() => {
    container = document.createElement('div');
    widget = stats({ container, cssClasses: { text: ['text', 'cx'] } });

    widget.init({
      helper: { state: {} },
      instantSearchInstance,
    });

    render.mockClear();
  });

  it('calls twice render(<Stats props />, container)', () => {
    const results = {
      hits: [{}, {}],
      nbHits: 20,
      page: 0,
      nbPages: 10,
      hitsPerPage: 2,
      processingTimeMS: 42,
      query: 'a query',
    };
    widget.render({ results, instantSearchInstance });
    widget.render({ results, instantSearchInstance });

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[0].props).toMatchSnapshot();
    expect(secondRender[1]).toEqual(container);
  });

  it('renders sorted hits', () => {
    const results = {
      hits: [{}, {}],
      nbHits: 20,
      nbSortedHits: 16,
      appliedRelevancyStrictness: 20,
      page: 0,
      nbPages: 10,
      hitsPerPage: 2,
      processingTimeMS: 42,
      query: 'second query',
    };
    widget.render({ results, instantSearchInstance });

    const [firstRender] = render.mock.calls;
    expect(firstRender[0].props).toEqual(
      expect.objectContaining({
        areHitsSorted: true,
        nbSortedHits: 16,
      })
    );
  });
});
