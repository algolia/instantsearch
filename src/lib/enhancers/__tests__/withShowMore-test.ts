import { createWithShowMore } from '../withShowMore';

describe('withShowMore', () => {
  test('goes through the lifecycle', () => {
    const showMoreSpy = jest.fn();
    const onToggleSpy = jest.fn();
    const withShowMore = createWithShowMore();

    // Trigger the higher-order function to spy the interactions
    withShowMore(showMoreSpy);
    expect(showMoreSpy).toHaveBeenCalledTimes(1);

    const props = showMoreSpy.mock.calls[0][0];
    expect(props.isShowingMore).toBeInstanceOf(Function);
    expect(props.toggleShowMore).toBeInstanceOf(Function);
    expect(props.onToggleShowMore).toBeInstanceOf(Function);
    expect(props.isShowingMore()).toEqual(false);

    const unsubscribeOnShowMore = props.onToggleShowMore(onToggleSpy);

    // The `onToggle` spy is not called before we toggle.
    expect(onToggleSpy).toHaveBeenCalledTimes(0);

    props.toggleShowMore();

    expect(props.isShowingMore()).toEqual(true);
    // The `onToggle` spy is called without arguments
    expect(onToggleSpy).toHaveBeenCalledTimes(1);
    expect(onToggleSpy).toHaveBeenLastCalledWith();

    unsubscribeOnShowMore();
    props.toggleShowMore();

    expect(props.isShowingMore()).toEqual(false);
    // The listener is unset, so it shouldn't be called anymore
    expect(onToggleSpy).toHaveBeenCalledTimes(1);
  });
});
