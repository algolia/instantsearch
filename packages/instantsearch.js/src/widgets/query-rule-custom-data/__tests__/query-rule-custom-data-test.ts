/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import algoliasearchHelper from 'algoliasearch-helper';
import { render as preactRender } from 'preact';

import {
  createDisposeOptions,
  createInitOptions,
} from '../../../../test/createWidget';
import queryRuleCustomData from '../query-rule-custom-data';

import type { QueryRuleCustomDataProps } from '../../../components/QueryRuleCustomData/QueryRuleCustomData';
import type { AlgoliaSearchHelper as Helper } from 'algoliasearch-helper';
import type { VNode } from 'preact';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');
  module.render = jest.fn();

  return module;
});

describe('queryRuleCustomData', () => {
  const createFakeHelper = (state = {}): Helper => {
    const client = createSearchClient();
    const indexName = '';
    const helper = algoliasearchHelper(client, indexName, state);

    helper.search = jest.fn();

    return helper;
  };

  beforeEach(() => {
    render.mockClear();
  });

  describe('Usage', () => {
    test('throws container error without options', () => {
      expect(() => {
        // @ts-expect-error
        queryRuleCustomData();
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rule-custom-data/js/"
`);
    });

    test('throws container error with empty options', () => {
      expect(() => {
        // @ts-expect-error
        queryRuleCustomData({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rule-custom-data/js/"
`);
    });

    it('is a widget', () => {
      const container = document.createElement('div');
      const widget = queryRuleCustomData({ container });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.queryRules',
          $$widgetType: 'ais.queryRuleCustomData',
        })
      );
    });
  });

  describe('Options', () => {
    describe('cssClasses', () => {
      test('applies default CSS classes', () => {
        const helper = createFakeHelper();
        const widget = queryRuleCustomData({
          container: document.createElement('div'),
        });

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        const firstRender = render.mock
          .calls[0][0] as VNode<QueryRuleCustomDataProps>;
        const { cssClasses } = firstRender.props as QueryRuleCustomDataProps;

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

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        const firstRender = render.mock
          .calls[0][0] as VNode<QueryRuleCustomDataProps>;
        const { cssClasses } = firstRender.props as QueryRuleCustomDataProps;

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

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        const firstRender = render.mock
          .calls[0][0] as VNode<QueryRuleCustomDataProps>;
        const { templates } = firstRender.props as QueryRuleCustomDataProps;

        expect(templates).toEqual({
          default: expect.any(Function),
        });
        expect(
          (templates.default as (data: { items: any[] }) => string)({
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

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        const firstRender = render.mock
          .calls[0][0] as VNode<QueryRuleCustomDataProps>;
        const { templates } = firstRender.props as QueryRuleCustomDataProps;

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

        widget.init!(
          createInitOptions({
            helper,
            state: helper.state,
          })
        );

        expect(render).toHaveBeenCalledTimes(1);

        widget.dispose!(
          createDisposeOptions({
            helper,
            state: helper.state,
          })
        );

        expect(render).toHaveBeenCalledTimes(2);
        expect(render).toHaveBeenCalledWith(null, container);
      });
    });
  });
});
