import { createShowMore } from '../createShowMore';

describe('createShowMore', () => {
  test('goes through the lifecycle', () => {
    const {
      toggleShowMore,
      setToggleShowMore,
      getIsShowingMore,
    } = createShowMore();

    expect(getIsShowingMore).toBeInstanceOf(Function);
    expect(toggleShowMore).toBeInstanceOf(Function);
    expect(setToggleShowMore).toBeInstanceOf(Function);

    expect(getIsShowingMore()).toEqual(false);

    const onToggleSpy = jest.fn();
    const unsubscribeOnShowMore = setToggleShowMore(onToggleSpy);

    // The `onToggle` spy is not called before we toggle.
    expect(onToggleSpy).toHaveBeenCalledTimes(0);

    toggleShowMore();

    expect(getIsShowingMore()).toEqual(true);
    // The `onToggle` spy is called without arguments
    expect(onToggleSpy).toHaveBeenCalledTimes(1);
    expect(onToggleSpy).toHaveBeenLastCalledWith();

    unsubscribeOnShowMore();
    toggleShowMore();

    expect(getIsShowingMore()).toEqual(false);
    // The listener is unset, so it shouldn't be called anymore
    expect(onToggleSpy).toHaveBeenCalledTimes(1);
  });

  test('toggles between `limit` and `showMoreLimit`', () => {
    const { toggleShowMore, getCurrentLimit } = createShowMore({
      limit: 10,
      showMoreLimit: 20,
    });

    expect(getCurrentLimit()).toEqual(10);

    toggleShowMore();

    expect(getCurrentLimit()).toEqual(20);

    toggleShowMore();

    expect(getCurrentLimit()).toEqual(10);
  });

  test('returns the `limit` as `getMaxValuesPerFacet()` when show more is not activated', () => {
    const { getMaxValuesPerFacet } = createShowMore({
      limit: 10,
      showMoreLimit: 20,
      showMore: false,
    });

    expect(getMaxValuesPerFacet()).toEqual(10);
  });

  test('returns the `showMoreLimit` as `getMaxValuesPerFacet()` when show more is not activated', () => {
    const { getMaxValuesPerFacet } = createShowMore({
      limit: 10,
      showMoreLimit: 20,
      showMore: true,
    });

    expect(getMaxValuesPerFacet()).toEqual(20);
  });
});
