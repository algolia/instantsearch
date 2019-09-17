import { createShowMore } from '../createShowMore';

describe('createShowMore', () => {
  test('goes through the lifecycle', () => {
    const {
      toggleShowMore,
      setToggleShowMore,
      isShowingMore,
    } = createShowMore();

    expect(isShowingMore).toBeInstanceOf(Function);
    expect(toggleShowMore).toBeInstanceOf(Function);
    expect(setToggleShowMore).toBeInstanceOf(Function);

    expect(isShowingMore()).toEqual(false);

    const onToggleSpy = jest.fn();
    const unsubscribeOnShowMore = setToggleShowMore(onToggleSpy);

    // The `onToggle` spy is not called before we toggle.
    expect(onToggleSpy).toHaveBeenCalledTimes(0);

    toggleShowMore();

    expect(isShowingMore()).toEqual(true);
    // The `onToggle` spy is called without arguments
    expect(onToggleSpy).toHaveBeenCalledTimes(1);
    expect(onToggleSpy).toHaveBeenLastCalledWith();

    unsubscribeOnShowMore();
    toggleShowMore();

    expect(isShowingMore()).toEqual(false);
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
});
