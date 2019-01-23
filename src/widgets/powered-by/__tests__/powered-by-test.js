import poweredBy from '../powered-by';

describe('poweredBy call', () => {
  it('throws an exception when no container', () => {
    expect(poweredBy).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/powered-by/js/"
`);
  });
});

describe('poweredBy', () => {
  let ReactDOM;
  let widget;
  let container;

  beforeEach(() => {
    ReactDOM = { render: jest.fn() };
    poweredBy.__Rewire__('render', ReactDOM.render);

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

  afterEach(() => {
    poweredBy.__ResetDependency__('render');
  });

  it('configures nothing', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('renders only once at init', () => {
    widget.render({});
    widget.render({});
    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);
  });
});
