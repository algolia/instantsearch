/* !---------------------------------------------------------------------------------------------
 *  Copyright (c) StackBlitz. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createChatStickToBottom } from 'instantsearch-ui-components';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';

export const useChatStickToBottom = createChatStickToBottom({
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
});
