/* !---------------------------------------------------------------------------------------------
 *  Copyright (c) StackBlitz. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { Hooks } from '../types';

export interface StickToBottomSpring {
  damping: number;
  stiffness: number;
  mass: number;
}

export type StickToBottomAnimation = 'instant' | StickToBottomSpring;

export interface StickToBottomCoreState {
  scrollTop: number;
  lastScrollTop?: number;
  ignoreScrollToTop?: number;
  targetScrollTop: number;
  calculatedTargetScrollTop: number;
  scrollDifference: number;
  resizeDifference: number;

  animation?: {
    behavior: StickToBottomAnimation;
    ignoreEscapes: boolean;
    promise: Promise<boolean>;
  };
  lastTick?: number;
  velocity: number;
  accumulated: number;

  escapedFromLock: boolean;
  isAtBottom: boolean;
  isNearBottom: boolean;

  resizeObserver?: ResizeObserver;
}

export interface StickToBottomElements {
  scrollElement: HTMLElement;
  contentElement: HTMLElement;
}

export interface StickToBottomCoreRequest {
  behavior: StickToBottomAnimation;
  waitElapsed: number;
  durationElapsed?: number;
  waitForCurrent: boolean;
  ignoreEscapes: boolean;
  preserveScrollPosition: boolean;
}

export interface StickToBottomCoreController<TScrollOptions> {
  initialIsAtBottom: boolean;
  calculateTargetScrollTop: (
    targetScrollTop: number,
    context: StickToBottomElements
  ) => number;
  createScrollRequest: (
    options: TScrollOptions | undefined
  ) => StickToBottomCoreRequest;
  createResizeRequest: (initial: boolean) => StickToBottomCoreRequest;
  createContinuationRequest: (
    ignoreEscapes: boolean,
    duration: number | undefined
  ) => StickToBottomCoreRequest;
}

export type StickToBottomCoreScroll<TScrollOptions> = (
  options?: TScrollOptions
) => Promise<boolean> | boolean;

export interface StickToBottomCoreInstance<TScrollOptions> {
  contentRef: { current: HTMLDivElement | null };
  scrollRef: { current: HTMLDivElement | null };
  scrollToBottom: StickToBottomCoreScroll<TScrollOptions>;
  stopScroll: () => void;
  isAtBottom: boolean;
  isNearBottom: boolean;
  escapedFromLock: boolean;
  state: StickToBottomCoreState;
}

export type CreateStickToBottomCoreParams = Pick<
  Hooks,
  'useCallback' | 'useEffect' | 'useMemo' | 'useRef' | 'useState'
>;

const STICK_TO_BOTTOM_OFFSET_PX = 70;
const SIXTY_FPS_INTERVAL_MS = 1000 / 60;

let mouseDown = false;

if (typeof window !== 'undefined') {
  window.document?.addEventListener('mousedown', () => {
    mouseDown = true;
  });

  window.document?.addEventListener('mouseup', () => {
    mouseDown = false;
  });

  window.document?.addEventListener('click', () => {
    mouseDown = false;
  });
}

export function createStickToBottomCore({
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
}: CreateStickToBottomCoreParams) {
  return function useStickToBottomCore<TScrollOptions>(
    controller: StickToBottomCoreController<TScrollOptions>
  ): StickToBottomCoreInstance<TScrollOptions> {
    const [escapedFromLock, updateEscapedFromLock] = useState(false);
    const [isAtBottom, updateIsAtBottom] = useState(
      controller.initialIsAtBottom
    );
    const [isNearBottom, setIsNearBottom] = useState(false);

    const controllerRef =
      useRef<StickToBottomCoreController<TScrollOptions>>(null!);
    controllerRef.current = controller;

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const isSelecting = useCallback(() => {
      if (!mouseDown) {
        return false;
      }

      if (typeof window === 'undefined') {
        return false;
      }

      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) {
        return false;
      }

      const range = selection.getRangeAt(0);
      return (
        range.commonAncestorContainer.contains(scrollRef.current) ||
        scrollRef.current?.contains(range.commonAncestorContainer)
      );
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: state is intentionally stable
    const state = useMemo<StickToBottomCoreState>(() => {
      return {
        escapedFromLock,
        isAtBottom,
        resizeDifference: 0,
        accumulated: 0,
        velocity: 0,

        get scrollTop() {
          return scrollRef.current?.scrollTop ?? 0;
        },
        set scrollTop(scrollTop: number) {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollTop;
            state.ignoreScrollToTop = scrollRef.current.scrollTop;
          }
        },

        get targetScrollTop() {
          if (!scrollRef.current || !contentRef.current) {
            return 0;
          }

          return (
            scrollRef.current.scrollHeight - 1 - scrollRef.current.clientHeight
          );
        },
        get calculatedTargetScrollTop() {
          if (!scrollRef.current || !contentRef.current) {
            return 0;
          }

          return controllerRef.current.calculateTargetScrollTop(
            this.targetScrollTop,
            {
              scrollElement: scrollRef.current,
              contentElement: contentRef.current,
            }
          );
        },

        get scrollDifference() {
          return this.calculatedTargetScrollTop - this.scrollTop;
        },

        get isNearBottom() {
          return this.scrollDifference <= STICK_TO_BOTTOM_OFFSET_PX;
        },
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setIsAtBottom = useCallback(
      (value: boolean) => {
        state.isAtBottom = value;
        updateIsAtBottom(value);
      },
      [state]
    );

    const setEscapedFromLock = useCallback(
      (value: boolean) => {
        state.escapedFromLock = value;
        updateEscapedFromLock(value);
      },
      [state]
    );

    const runScroll = useCallback(
      (request: StickToBottomCoreRequest): Promise<boolean> | boolean => {
        if (!request.preserveScrollPosition) {
          setIsAtBottom(true);
        }

        let startTarget = state.calculatedTargetScrollTop;

        const next = (): Promise<boolean> => {
          const promise = new Promise(requestAnimationFrame).then(() => {
            if (!state.isAtBottom) {
              state.animation = undefined;

              return false;
            }

            const { scrollTop } = state;
            const tick = performance.now();
            const tickDelta =
              (tick - (state.lastTick ?? tick)) / SIXTY_FPS_INTERVAL_MS;
            state.animation ||= {
              behavior: request.behavior,
              promise,
              ignoreEscapes: request.ignoreEscapes,
            };

            if (state.animation.behavior === request.behavior) {
              state.lastTick = tick;
            }

            if (isSelecting()) {
              return next();
            }

            if (request.waitElapsed > Date.now()) {
              return next();
            }

            if (
              scrollTop < Math.min(startTarget, state.calculatedTargetScrollTop)
            ) {
              if (state.animation?.behavior === request.behavior) {
                if (request.behavior === 'instant') {
                  state.scrollTop = state.calculatedTargetScrollTop;
                  return next();
                }

                state.velocity =
                  (request.behavior.damping * state.velocity +
                    request.behavior.stiffness * state.scrollDifference) /
                  request.behavior.mass;
                state.accumulated += state.velocity * tickDelta;
                state.scrollTop += state.accumulated;

                if (state.scrollTop !== scrollTop) {
                  state.accumulated = 0;
                }
              }

              return next();
            }

            if (
              request.durationElapsed !== undefined &&
              request.durationElapsed > Date.now()
            ) {
              startTarget = state.calculatedTargetScrollTop;

              return next();
            }

            state.animation = undefined;

            if (state.scrollTop < state.calculatedTargetScrollTop) {
              return runScroll(
                controllerRef.current.createContinuationRequest(
                  request.ignoreEscapes,
                  request.durationElapsed === undefined
                    ? undefined
                    : Math.max(0, request.durationElapsed - Date.now()) ||
                        undefined
                )
              );
            }

            return state.isAtBottom;
          });

          return promise.then((result) => {
            requestAnimationFrame(() => {
              if (!state.animation) {
                state.lastTick = undefined;
                state.velocity = 0;
              }
            });

            return result;
          });
        };

        if (!request.waitForCurrent) {
          state.animation = undefined;
        }

        if (state.animation?.behavior === request.behavior) {
          return state.animation.promise;
        }

        return next();
      },
      [isSelecting, setIsAtBottom, state]
    );

    const scrollToBottom = useCallback<StickToBottomCoreScroll<TScrollOptions>>(
      (options) =>
        runScroll(controllerRef.current.createScrollRequest(options)),
      [runScroll]
    );

    const stopScroll = useCallback((): void => {
      setEscapedFromLock(true);
      setIsAtBottom(false);
    }, [setEscapedFromLock, setIsAtBottom]);

    const handleScroll = useCallback(
      ({ target }: Event) => {
        if (target !== scrollRef.current) {
          return;
        }

        const { scrollTop, ignoreScrollToTop } = state;
        let { lastScrollTop = scrollTop } = state;

        state.lastScrollTop = scrollTop;
        state.ignoreScrollToTop = undefined;

        if (ignoreScrollToTop && ignoreScrollToTop > scrollTop) {
          lastScrollTop = ignoreScrollToTop;
        }

        setIsNearBottom(state.isNearBottom);

        setTimeout(() => {
          if (state.resizeDifference || scrollTop === ignoreScrollToTop) {
            return;
          }

          if (isSelecting()) {
            setEscapedFromLock(true);
            setIsAtBottom(false);
            return;
          }

          const isScrollingDown = scrollTop > lastScrollTop;
          const isScrollingUp = scrollTop < lastScrollTop;

          if (state.animation?.ignoreEscapes) {
            state.scrollTop = lastScrollTop;
            return;
          }

          if (isScrollingUp) {
            setEscapedFromLock(true);
            setIsAtBottom(false);
          }

          if (isScrollingDown) {
            setEscapedFromLock(false);
          }

          if (!state.escapedFromLock && state.isNearBottom) {
            setIsAtBottom(true);
          }
        }, 1);
      },
      [setEscapedFromLock, setIsAtBottom, isSelecting, state]
    );

    const handleWheel = useCallback(
      ({ target, deltaY }: WheelEvent) => {
        let element = target as HTMLElement;

        while (
          !['scroll', 'auto'].includes(getComputedStyle(element).overflow)
        ) {
          if (!element.parentElement) {
            return;
          }

          element = element.parentElement;
        }

        if (
          element === scrollRef.current &&
          deltaY < 0 &&
          scrollRef.current.scrollHeight > scrollRef.current.clientHeight &&
          !state.animation?.ignoreEscapes
        ) {
          setEscapedFromLock(true);
          setIsAtBottom(false);
        }
      },
      [setEscapedFromLock, setIsAtBottom, state]
    );

    useEffect(() => {
      const scroll = scrollRef.current;
      if (!scroll) {
        return undefined;
      }

      scroll.addEventListener('scroll', handleScroll, { passive: true });
      scroll.addEventListener('wheel', handleWheel, { passive: true });

      return () => {
        scroll.removeEventListener('scroll', handleScroll);
        scroll.removeEventListener('wheel', handleWheel);
      };
    }, [handleScroll, handleWheel]);

    useEffect(() => {
      const content = contentRef.current;
      if (!content) {
        return undefined;
      }

      let previousHeight: number | undefined;

      const resizeObserver = new ResizeObserver(([entry]) => {
        const { height } = entry.contentRect;
        const difference = height - (previousHeight ?? height);

        state.resizeDifference = difference;

        if (state.scrollTop > state.targetScrollTop) {
          state.scrollTop = state.targetScrollTop;
        }

        setIsNearBottom(state.isNearBottom);

        if (difference >= 0) {
          runScroll(
            controllerRef.current.createResizeRequest(
              previousHeight === undefined
            )
          );
        } else if (state.isNearBottom) {
          setEscapedFromLock(false);
          setIsAtBottom(true);
        }

        previousHeight = height;

        requestAnimationFrame(() => {
          setTimeout(() => {
            if (state.resizeDifference === difference) {
              state.resizeDifference = 0;
            }
          }, 1);
        });
      });

      resizeObserver.observe(content);
      state.resizeObserver = resizeObserver;

      return () => {
        resizeObserver.disconnect();
        state.resizeObserver = undefined;
      };
    }, [
      state,
      setIsNearBottom,
      setEscapedFromLock,
      setIsAtBottom,
      runScroll,
    ]);

    return {
      contentRef,
      scrollRef,
      scrollToBottom,
      stopScroll,
      isAtBottom: isAtBottom || isNearBottom,
      isNearBottom,
      escapedFromLock,
      state,
    };
  };
}
