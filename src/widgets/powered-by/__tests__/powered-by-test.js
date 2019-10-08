import { render } from 'preact';
import poweredBy from '../powered-by';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

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

  it('renders only once at init', () => {
    widget.render({});
    widget.render({});

    const [firstRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(1);
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
  });
});
