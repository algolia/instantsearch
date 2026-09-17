import { createResultCardComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment, useEffect, useState } from 'react';
import { useResultCard } from 'react-instantsearch-core';

import type { Pragma, ResultCardOwnProps } from 'instantsearch-ui-components';
import type { ResultCardRenderState } from 'instantsearch.js/es/connectors/result-card/connectResultCard';
import type { UseResultCardProps } from 'react-instantsearch-core';

const ResultCardUi = createResultCardComponent({
  createElement: createElement as Pragma,
  Fragment,
  useState,
  useEffect,
});

/**
 * Props passed to a custom `layoutComponent`: the connector render state, so a
 * layout component owns the full markup, including every status and the
 * dismiss, retry, and handoff actions.
 */
export type ResultCardLayoutComponentProps = ResultCardRenderState;

type OwnedUiProps =
  | 'status'
  | 'messages'
  | 'error'
  | 'suggestions'
  | 'tools'
  | 'indexUiState'
  | 'setIndexUiState'
  | 'onDismiss'
  | 'onRetry'
  | 'canContinueInChat'
  | 'onContinueInChat'
  | 'expanded'
  | 'onExpandedChange';

export type ResultCardProps = Omit<ResultCardOwnProps, OwnedUiProps> &
  UseResultCardProps & {
    layoutComponent?: (
      props: ResultCardLayoutComponentProps
    ) => JSX.Element | null;
  };

export function ResultCard({
  classNames = {},
  layoutComponent: LayoutComponent,
  // Connector params — forwarded to the hook, not the UI root.
  agentId,
  transport,
  requestOptions,
  ...props
}: ResultCardProps) {
  const renderState = useResultCard(
    {
      agentId,
      ...(transport ? { transport } : { requestOptions }),
    } as UseResultCardProps,
    { $$widgetType: 'ais.resultCard' }
  );

  if (LayoutComponent) {
    return <LayoutComponent {...renderState} />;
  }

  return (
    <ResultCardUi
      {...props}
      classNames={classNames}
      status={renderState.status}
      messages={renderState.messages}
      error={renderState.error}
      suggestions={renderState.suggestions}
      tools={renderState.tools}
      indexUiState={renderState.indexUiState}
      setIndexUiState={renderState.setIndexUiState}
      onDismiss={renderState.dismiss}
      onRetry={renderState.retry}
      canContinueInChat={renderState.canContinueInChat}
      onContinueInChat={renderState.continueInChat}
      expanded={renderState.expanded}
      onExpandedChange={renderState.setExpanded}
    />
  );
}
