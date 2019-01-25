import { render } from 'preact-compat';
import poweredBy from '../powered-by';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

describe('poweredBy call', () => {
  it('throws an exception when no container', () => {
    expect(poweredBy).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/powered-by/js/"
`);
  });
});

describe('poweredBy', () => {
  let widget;
  let container;

  beforeEach(() => {
    render.mockClear();

    container = document.createElement('div');
    widget = poweredBy({
      container,
      cssClasses: {
        root: 'root',
        link: 'link',
        logo: 'logo',
      },
    });

    widget.init({});
  });

  it('configures nothing', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('renders only once at init', () => {
    widget.render({});
    widget.render({});
    expect(render).toHaveBeenCalledTimes(1);
    expect(render.mock.calls[0][0]).toMatchSnapshot();
    expect(render.mock.calls[0][1]).toEqual(container);
  });
});
