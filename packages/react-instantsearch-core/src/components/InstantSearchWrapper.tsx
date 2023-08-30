import React from 'react';

import type { PromiseWithState } from '../lib/wrapPromiseWithState';
import type { MutableRefObject } from 'react';

export type ServerInsertedHTMLHook = (callbacks: () => React.ReactNode) => void;
export type InstantSearchRSCContextValue = {
  promiseRef: MutableRefObject<PromiseWithState<void> | null>;
  insertHTML: ServerInsertedHTMLHook;
};

const InstantSearchRSCContext =
  React.createContext<InstantSearchRSCContextValue>({
    promiseRef: { current: null },
    insertHTML: () => {},
  });

export function useRSCContext() {
  return React.useContext(InstantSearchRSCContext);
}

export function InstantSearchWrapper({
  children,
  ServerInsertedHTMLContext,
}: {
  children: React.ReactElement;
  ServerInsertedHTMLContext: React.Context<ServerInsertedHTMLHook | null>;
}) {
  const promiseRef = React.useRef<PromiseWithState<void> | null>(null);
  const insertHTML =
    React.useContext(ServerInsertedHTMLContext) ||
    (() => {
      throw new Error('Missing ServerInsertedHTMLContext');
    });

  return (
    <InstantSearchRSCContext.Provider value={{ promiseRef, insertHTML }}>
      {children}
    </InstantSearchRSCContext.Provider>
  );
}
