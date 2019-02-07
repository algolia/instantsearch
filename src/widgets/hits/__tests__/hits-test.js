import { render } from 'preact-compat';
import defaultTemplates from '../defaultTemplates';
import hits from '../hits';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

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
    results = { hits: [{ first: 'hit', second: 'hit' }] };
  });

  it('calls twice render(<Hits props />, container)', () => {
    widget.render({ results });
    widget.render({ results });

    expect(render).toHaveBeenCalledTimes(2);
    expect(render.mock.calls[0][0]).toMatchSnapshot();
    expect(render.mock.calls[0][1]).toEqual(container);
    expect(render.mock.calls[1][0]).toMatchSnapshot();
    expect(render.mock.calls[1][1]).toEqual(container);
  });

  it('renders transformed items', () => {
    widget = hits({
      container,
      transformItems: items =>
        items.map(item => ({ ...item, transformed: true })),
    });

    widget.init({ instantSearchInstance: {} });
    widget.render({ results });

    expect(render.mock.calls[0][0]).toMatchSnapshot();
  });

  it('does not accept both item and allItems templates', () => {
    expect(
      hits.bind({ container, templates: { item: '', allItems: '' } })
    ).toThrow();
  });
});
