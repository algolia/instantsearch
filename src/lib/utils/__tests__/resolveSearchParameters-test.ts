import { createInitOptions } from '../../../../test/mock/createWidget';
import index from '../../../widgets/index/index';
import resolve from '../resolveSearchParameters';

describe('mergeSearchParameters', () => {
  describe('1 level', () => {
    it('resolves the `SearchParameters` from the level 0', () => {
      const level0 = index({ indexName: 'level_0_index_name' });

      level0.init(createInitOptions({ parent: null }));

      const actual = resolve(level0);

      expect(actual).toEqual([level0.getHelper()!.state]);
    });
  });

  describe('2 levels', () => {
    const level0 = index({ indexName: 'level_0_index_name' });
    const level1 = index({ indexName: 'level_1_index_name' });

    level0.addWidgets([level1]);
    level0.init(createInitOptions({ parent: null }));

    it('resolves the `SearchParameters` from the level 0', () => {
      expect(resolve(level0)).toEqual([level0.getHelper()!.state]);
    });

    it('resolves the `SearchParameters` from the level 1', () => {
      expect(resolve(level1)).toEqual([
        level0.getHelper()!.state,
        level1.getHelper()!.state,
      ]);
    });
  });

  describe('3 levels', () => {
    const level0 = index({ indexName: 'level_0_index_name' });
    const level1 = index({ indexName: 'level_1_index_name' });
    const level2 = index({ indexName: 'level_2_index_name' });

    level0.addWidgets([level1.addWidgets([level2])]);
    level0.init(createInitOptions({ parent: null }));

    it('resolves the `SearchParameters` from the level 0', () => {
      expect(resolve(level0)).toEqual([level0.getHelper()!.state]);
    });

    it('resolves the `SearchParameters` from the level 1', () => {
      expect(resolve(level1)).toEqual([
        level0.getHelper()!.state,
        level1.getHelper()!.state,
      ]);
    });

    it('resolves the `SearchParameters` from the level 2', () => {
      expect(resolve(level2)).toEqual([
        level0.getHelper()!.state,
        level1.getHelper()!.state,
        level2.getHelper()!.state,
      ]);
    });
  });
});
