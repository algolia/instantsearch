/* !---------------------------------------------------------------------------------------------
 *  Copyright (c) StackBlitz. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  createStickToBottomCore,
  StickToBottomCoreController,
  StickToBottomCoreRequest,
} from './stickToBottomCore';

import type { Hooks } from '../types';

type CreateChatStickToBottomParams = Pick<
  Hooks,
  'useCallback' | 'useEffect' | 'useMemo' | 'useRef' | 'useState'
>;

export interface ChatScrollToBottomOptions {
  preserveScrollPosition?: boolean;
}

const CHAT_SPRING_ANIMATION = {
  damping: 0.7,
  stiffness: 0.05,
  mass: 1.25,
};
const RETAIN_ANIMATION_DURATION_MS = 350;

function createRequest({
  preserveScrollPosition = false,
  waitForCurrent = false,
  duration = 0,
}: {
  preserveScrollPosition?: boolean;
  waitForCurrent?: boolean;
  duration?: number;
} = {}): StickToBottomCoreRequest {
  const waitElapsed = Date.now() + Number(waitForCurrent);

  return {
    behavior: CHAT_SPRING_ANIMATION,
    waitElapsed,
    durationElapsed: waitElapsed + duration,
    waitForCurrent,
    ignoreEscapes: false,
    preserveScrollPosition,
  };
}

const CHAT_CONTROLLER: StickToBottomCoreController<ChatScrollToBottomOptions> = {
  initialIsAtBottom: true,
  calculateTargetScrollTop(targetScrollTop) {
    return targetScrollTop;
  },
  createScrollRequest(options) {
    return createRequest(options);
  },
  createResizeRequest() {
    return createRequest({
      preserveScrollPosition: true,
      waitForCurrent: true,
      duration: RETAIN_ANIMATION_DURATION_MS,
    });
  },
  createContinuationRequest(_ignoreEscapes, duration) {
    return createRequest({ duration });
  },
};

export function createChatStickToBottom(hooks: CreateChatStickToBottomParams) {
  const useStickToBottomCore = createStickToBottomCore(hooks);

  return function useChatStickToBottom() {
    return useStickToBottomCore(CHAT_CONTROLLER);
  };
}
