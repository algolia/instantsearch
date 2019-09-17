interface ShowMoreState {
  isShowingMore: boolean;
}

type Listener = () => void;

type ShowMoreCallback = ({
  toggleShowMore,
  isShowingMore,
  onToggleShowMore,
}: {
  toggleShowMore: () => void;
  isShowingMore: () => boolean;
  onToggleShowMore: (listener: Listener) => void;
}) => void;

export function createWithShowMore(initialState?: Partial<ShowMoreState>) {
  const state: ShowMoreState = {
    isShowingMore: false,
    ...initialState,
  };

  let onToggle: Listener | null = null;

  function toggleShowMore() {
    state.isShowingMore = !state.isShowingMore;

    if (onToggle) {
      onToggle();
    }
  }

  function onToggleShowMore(listener: Listener) {
    onToggle = listener;

    return () => {
      onToggle = null;
    };
  }

  // Get always a fresh state with values computed via functions.
  const freshState = {
    toggleShowMore: () => toggleShowMore(),
    isShowingMore: () => state.isShowingMore,
  };

  return function withShowMore(fn: ShowMoreCallback) {
    return fn({
      toggleShowMore: freshState.toggleShowMore,
      isShowingMore: freshState.isShowingMore,
      onToggleShowMore,
    });
  };
}
