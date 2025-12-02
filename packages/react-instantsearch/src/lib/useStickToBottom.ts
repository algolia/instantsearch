/* !---------------------------------------------------------------------------------------------
 *  Copyright (c) StackBlitz. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createStickToBottom } from 'instantsearch-ui-components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const useStickToBottom = createStickToBottom({
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
});
