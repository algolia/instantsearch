import { render } from 'preact';
import defaultTemplates from '../defaultTemplates';
import hits from '../hits';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      hits({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits/js/"
`);
  });
});

describe('hits()', () => {
  let container;
  let templateProps;
  let widget;
  let results;

  beforeEach(() => {
    render.mockClear();

    container = document.createElement('div');
    templateProps = {
      templatesConfig: undefined,
      templates: defaultTemplates,
      useCustomCompileOptions: { item: false, empty: false },
    };
    widget = hits({ container, cssClasses: { root: ['root', 'cx'] } });
    widget.init({ instantSearchInstance: { templateProps } });
    results = {
      hits: [{ first: 'hit', second: 'hit' }],
      hitsPerPage: 4,
      page: 2,
    };
  });

  it('calls twice render(<Hits props />, container)', () => {
    widget.render({ results });
    widget.render({ results });

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[0].props).toMatchSnapshot();
    expect(secondRender[1]).toEqual(container);
  });

  it('renders transformed items', () => {
    widget = hits({
      container,
      transformItems: items =>
        items.map(item => ({ ...item, transformed: true })),
    });

    widget.init({ instantSearchInstance: {} });
    widget.render({ results });

    const [firstRender] = render.mock.calls;

    expect(firstRender[0].props).toMatchSnapshot();
  });

  it('should add __position key with absolute position', () => {
    results = { ...results, page: 4, hitsPerPage: 10 };
    const state = { page: results.page };

    widget.render({ results, state });

    expect(results.hits[0].__position).toEqual(41);
  });
});
