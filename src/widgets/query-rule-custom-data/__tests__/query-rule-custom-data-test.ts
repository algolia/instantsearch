import { render, unmountComponentAtNode } from 'preact-compat';
import algoliasearchHelper from 'algoliasearch-helper';
import queryRuleCustomData from '../query-rule-custom-data';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();
  module.unmountComponentAtNode = jest.fn();

  return module;
});

describe('queryRuleCustomData', () => {
  const createFakeHelper = (state: object = {}) => {
    const client = {};
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
    test('throws without container', () => {
      expect(() => {
        queryRuleCustomData({
          // @ts-ignore
          container: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rule-custom-data/js/"
`);
    });
  });

  describe('Options', () => {
    describe('templates', () => {
      test('applies default template', () => {
        const helper = createFakeHelper();
        const widget = queryRuleCustomData({
          container: document.createElement('div'),
        });

        widget.init({ helper, state: helper.state, instantSearchInstance: {} });

        const { templates } = render.mock.calls[0][0].props.templateProps;

        expect(templates).toEqual({
          default: '',
        });
      });

      test('applies custom template', () => {
        const helper = createFakeHelper();
        const widget = queryRuleCustomData({
          container: document.createElement('div'),
          templates: {
            default: 'default',
          },
        });

        widget.init({ helper, state: helper.state, instantSearchInstance: {} });

        const { templates } = render.mock.calls[0][0].props.templateProps;

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

        widget.init({ helper, state: helper.state, instantSearchInstance: {} });
        widget.dispose({ state: helper.getState() });

        expect(unmountComponentAtNode).toHaveBeenCalledTimes(1);
      });
    });
  });
});
