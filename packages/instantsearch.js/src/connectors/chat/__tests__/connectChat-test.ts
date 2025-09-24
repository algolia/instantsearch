import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import connectChat from '../connectChat';

describe('connectChat', () => {
  it('throws without render function', () => {
    expect(() => {
      // @ts-expect-error
      connectChat()({});
    }).toThrowErrorMatchingInlineSnapshot(`
      "The render function is not valid (received type Undefined).

      See documentation: https://www.algolia.com/doc/api-reference/widgets/chat/js/#connector"
    `);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customChat = connectChat(render, unmount);
    const widget = customChat({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.chat',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectChat(renderFn);
    const widget = makeWidget({ agentId: 'agentId' });

    // test if widget is not rendered yet at this point
    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init(createInitOptions({ helper, state: helper.state }));

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { agentId: 'agentId' } }),
      true
    );

    const renderOptions = createRenderOptions({ helper });
    widget.render(renderOptions);

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { agentId: 'agentId' } }),
      false
    );
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const unmountFn = jest.fn();
      const makeWidget = connectChat(() => {}, unmountFn);
      const widget = makeWidget({ agentId: 'agentId' });

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose();
      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const makeWidget = connectChat(() => {});
      const widget = makeWidget({ agentId: 'agentId' });

      expect(() => widget.dispose()).not.toThrow();
    });
  });
});
