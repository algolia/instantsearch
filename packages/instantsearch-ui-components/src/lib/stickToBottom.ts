/* !---------------------------------------------------------------------------------------------
 *  Copyright (c) StackBlitz. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  createStickToBottomCore,
  StickToBottomCoreController,
  StickToBottomCoreRequest,
  StickToBottomCoreState,
} from './stickToBottomCore';

import type { Hooks } from '../types';

const DEFAULT_SPRING_ANIMATION = {
  /**
   * A value from 0 to 1, on how much to damp the animation.
   * 0 means no damping, 1 means full damping.
   *
   * @default 0.7
   */
  damping: 0.7,

  /**
   * The stiffness of how fast/slow the animation gets up to speed.
   *
   * @default 0.05
   */
  stiffness: 0.05,

  /**
   * The inertial mass associated with the animation.
   * Higher numbers make the animation slower.
   *
   * @default 1.25
   */
  mass: 1.25,
};

export type SpringAnimation = Partial<typeof DEFAULT_SPRING_ANIMATION>;

export type Animation = ScrollBehavior | SpringAnimation;

export interface ScrollElements {
  scrollElement: HTMLElement;
  contentElement: HTMLElement;
}

export type GetTargetScrollTop = (
  targetScrollTop: number,
  context: ScrollElements
) => number;

export interface StickToBottomOptions extends SpringAnimation {
  resize?: Animation;
  initial?: Animation | boolean;
  targetScrollTop?: GetTargetScrollTop;
}

export type ScrollToBottomOptions =
  | ScrollBehavior
  | {
      animation?: Animation;

      /**
       * Whether to wait for any existing scrolls to finish before
       * performing this one. Or if a millisecond is passed,
       * it will wait for that duration before performing the scroll.
       *
       * @default false
       */
      wait?: boolean | number;

      /**
       * Whether to prevent the user from escaping the scroll,
       * by scrolling up with their mouse.
       */
      ignoreEscapes?: boolean;

      /**
       * Only scroll to the bottom if we're already at the bottom.
       *
       * @default false
       */
      preserveScrollPosition?: boolean;

      /**
       * The extra duration in ms that this scroll event should persist for.
       * (in addition to the time that it takes to get to the bottom)
       *
       * Not to be confused with the duration of the animation -
       * for that you should adjust the animation option.
       *
       * @default 0
       */
      duration?: number | Promise<void>;
    };

export type ScrollToBottom = (
  scrollOptions?: ScrollToBottomOptions
) => Promise<boolean> | boolean;
export type StopScroll = () => void;

export interface StickToBottomState
  extends Omit<StickToBottomCoreState, 'animation'> {
  animation?: {
    behavior: 'instant' | Required<SpringAnimation>;
    ignoreEscapes: boolean;
    promise: Promise<boolean>;
  };
}

export interface StickToBottomInstance {
  contentRef: { current: HTMLDivElement | null };
  scrollRef: { current: HTMLDivElement | null };
  scrollToBottom: ScrollToBottom;
  stopScroll: StopScroll;
  isAtBottom: boolean;
  isNearBottom: boolean;
  escapedFromLock: boolean;
  state: StickToBottomState;
}

type CreateStickToBottomParams = Pick<
  Hooks,
  'useCallback' | 'useEffect' | 'useMemo' | 'useRef' | 'useState'
>;

const RETAIN_ANIMATION_DURATION_MS = 350;

export function createStickToBottom(hooks: CreateStickToBottomParams) {
  const useStickToBottomCore = createStickToBottomCore(hooks);

  return function useStickToBottom(
    options: StickToBottomOptions = {}
  ): StickToBottomInstance {
    const optionsRef = hooks.useRef<StickToBottomOptions>(null!);
    optionsRef.current = options;

    const controller = hooks.useMemo<
      StickToBottomCoreController<ScrollToBottomOptions>
    >(() => {
      let lastCalculation:
        | { targetScrollTop: number; calculatedScrollTop: number }
        | undefined;

      const createRequest = (
        scrollOptions: ScrollToBottomOptions = {}
      ): StickToBottomCoreRequest => {
        if (typeof scrollOptions === 'string') {
          scrollOptions = { animation: scrollOptions };
        }

        const waitElapsed =
          Date.now() + (Number(scrollOptions.wait) || 0);
        const request: StickToBottomCoreRequest = {
          behavior: mergeAnimations(
            optionsRef.current,
            scrollOptions.animation
          ),
          waitElapsed,
          waitForCurrent: scrollOptions.wait === true,
          ignoreEscapes: scrollOptions.ignoreEscapes ?? false,
          preserveScrollPosition:
            scrollOptions.preserveScrollPosition ?? false,
        };

        if (scrollOptions.duration instanceof Promise) {
          scrollOptions.duration.then(
            () => {
              request.durationElapsed = Date.now();
            },
            () => {
              request.durationElapsed = Date.now();
            }
          );
        } else {
          request.durationElapsed =
            waitElapsed + (scrollOptions.duration ?? 0);
        }

        return request;
      };

      return {
        initialIsAtBottom: optionsRef.current.initial !== false,
        calculateTargetScrollTop(targetScrollTop, context) {
          if (!optionsRef.current.targetScrollTop) {
            return targetScrollTop;
          }

          if (lastCalculation?.targetScrollTop === targetScrollTop) {
            return lastCalculation.calculatedScrollTop;
          }

          const calculatedScrollTop = Math.max(
            Math.min(
              optionsRef.current.targetScrollTop(targetScrollTop, context),
              targetScrollTop
            ),
            0
          );

          lastCalculation = { targetScrollTop, calculatedScrollTop };

          requestAnimationFrame(() => {
            lastCalculation = undefined;
          });

          return calculatedScrollTop;
        },
        createScrollRequest: createRequest,
        createResizeRequest(initial) {
          const behavior = mergeAnimations(
            optionsRef.current,
            initial
              ? optionsRef.current.initial
              : optionsRef.current.resize
          );

          return createRequest({
            animation: behavior,
            wait: true,
            preserveScrollPosition: true,
            duration:
              behavior === 'instant'
                ? undefined
                : RETAIN_ANIMATION_DURATION_MS,
          });
        },
        createContinuationRequest(ignoreEscapes, duration) {
          return createRequest({
            animation: mergeAnimations(
              optionsRef.current,
              optionsRef.current.resize
            ),
            ignoreEscapes,
            duration,
          });
        },
      };
    }, []);

    return useStickToBottomCore(controller) as StickToBottomInstance;
  };
}

const animationCache = new Map<string, Readonly<Required<SpringAnimation>>>();

function mergeAnimations(
  ...animations: Array<Animation | boolean | undefined>
) {
  const result = { ...DEFAULT_SPRING_ANIMATION };
  let instant = false;

  animations.forEach((animation) => {
    if (animation === 'instant') {
      instant = true;
      return;
    }

    if (typeof animation !== 'object') {
      return;
    }

    instant = false;

    result.damping = animation.damping ?? result.damping;
    result.stiffness = animation.stiffness ?? result.stiffness;
    result.mass = animation.mass ?? result.mass;
  });

  const key = JSON.stringify(result);

  if (!animationCache.has(key)) {
    animationCache.set(key, Object.freeze(result));
  }

  return instant ? 'instant' : animationCache.get(key)!;
}
