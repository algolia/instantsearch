import { render, unmountComponentAtNode } from 'preact-compat';
import algoliasearchHelper from 'algoliasearch-helper';
import { Client, Helper } from '../../../types';
import queryRuleCustomData from '../query-rule-custom-data';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();
  module.unmountComponentAtNode = jest.fn();

  return module;
});

describe('queryRuleCustomData', () => {
  const defaultInitOptions = {
    instantSearchInstance: {
      helper: null,
      widgets: [],
    },
    templatesConfig: {},
    createURL: () => '#',
  };

  const createFakeClient = (options = {}): Client => {
    return options as Client;
  };

  const createFakeHelper = (state = {}): Helper => {
    const client = createFakeClient();
    const indexName = '';
    const helper = algoliasearchHelper(client, indexName, state);

    helper.search = jest.fn();

    return helper;
  };

  beforeEach(() => {
    render.mockClear();
    unmountComponentAtNode.mockClear();
  });

  describe('Usage', () => {
    test('throws container error without options', () => {
      expect(() => {
        // @ts-ignore
        queryRuleCustomData();
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rule-custom-data/js/"
`);
    });

    test('throws container error with empty options', () => {
      expect(() => {
        // @ts-ignore
        queryRuleCustomData({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rule-custom-data/js/"
`);
    });
  });

  describe('Options', () => {
    describe('cssClasses', () => {
      test('applies default CSS classes', () => {
        const helper = createFakeHelper();
        const widget = queryRuleCustomData({
          container: document.createElement('div'),
        });

        widget.init!({
          ...defaultInitOptions,
          helper,
          state: helper.state,
        });

        const { cssClasses } = render.mock.calls[0][0].props;

        expect(cssClasses).toEqual({
          root: 'ais-QueryRuleCustomData',
        });
      });

      test('applies custom CSS classes', () => {
        const helper = createFakeHelper();
        const widget = queryRuleCustomData({
          container: document.createElement('div'),
          cssClasses: {
            root: 'CustomRoot',
          },
        });

        widget.init!({
          ...defaultInitOptions,
          helper,
          state: helper.state,
        });

        const { cssClasses } = render.mock.calls[0][0].props;

        expect(cssClasses).toEqual({
          root: 'ais-QueryRuleCustomData CustomRoot',
        });
      });
    });

    describe('templates', () => {
      test('applies default template', () => {
        const helper = createFakeHelper();
        const widget = queryRuleCustomData({
          container: document.createElement('div'),
        });

        widget.init!({
          ...defaultInitOptions,
          helper,
          state: helper.state,
        });

        const { templates } = render.mock.calls[0][0].props;

        expect(templates).toEqual({
          default: expect.any(Function),
        });
        expect(
          templates.default({
            items: [{ banner: '1.jpg' }, { banner: '2.jpg' }],
          })
        ).toMatchInlineSnapshot(`
"[
  {
    \\"banner\\": \\"1.jpg\\"
  },
  {
    \\"banner\\": \\"2.jpg\\"
  }
]"
`);
      });

      test('applies custom template', () => {
        const helper = createFakeHelper();
        const widget = queryRuleCustomData({
          container: document.createElement('div'),
          templates: {
            default: 'default',
          },
        });

        widget.init!({
          ...defaultInitOptions,
          helper,
          state: helper.state,
        });

        const { templates } = render.mock.calls[0][0].props;

        expect(templates).toEqual({
          default: 'default',
        });
      });
    });
  });

  describe('Lifecycle', () => {
    describe('unmountFn', () => {
      test('unmounts the component', () => {
        const container = document.createElement('div');
        const helper = createFakeHelper();
        const widget = queryRuleCustomData({
          container,
        });

        widget.init!({
          ...defaultInitOptions,
          helper,
          state: helper.state,
        });
        widget.dispose!({
          helper,
          state: helper.getState(),
        });

        expect(unmountComponentAtNode).toHaveBeenCalledTimes(1);
      });
    });
  });
});
