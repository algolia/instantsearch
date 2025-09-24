/**
 * @jest-environment @instantsearch/testutils/jest-environment-node.js
 */

import { walkIndex } from '..';
import { index } from '../../../widgets';

describe('walkIndex', () => {
  test('calls the callback once for each widget', () => {
    const callback = jest.fn();

    walkIndex(
      index({ indexName: '1', indexId: '1' }).addWidgets([
        index({ indexName: '2', indexId: '2' }).addWidgets([
          index({ indexName: '3', indexId: '3' }),
        ]),
        index({ indexName: '4', indexId: '4' }),
      ]),
      callback
    );

    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback.mock.calls.map((call) => call[0].getIndexId())).toEqual([
      '1',
      '2',
      '3',
      '4',
    ]);
  });
});
