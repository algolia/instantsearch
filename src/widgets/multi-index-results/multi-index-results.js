import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import MultiIndexResults from '../../components/MultiIndexResults';
import connectMultiIndexResults from '../../connectors/multi-index-results/connectMultiIndexResults';
import defaultTemplates from './defaultTemplates';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils';

const bem = bemHelper('ais-multi-index-results');

const renderer = ({
  renderState,
  cssClasses,
  containerNode,
  transformData,
  templates,
}) => ({ derivedIndices, instantSearchInstance }, isFirstRendering) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  render(
    <MultiIndexResults
      cssClasses={cssClasses}
      derivedIndices={derivedIndices}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
multiIndexResults({
  container,
  indices,
})
`;

export default function multiIndexResults({
  container,
  cssClasses: userCssClasses = {},
  transformData,
  indices,
  escapeHits = false,
}) {
  if (!container) {
    throw new Error(`Must provide a container.${usage}`);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
    empty: cx(bem(null, 'empty'), userCssClasses.empty),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    transformData,
  });

  try {
    const makeMultiIndexResults = connectMultiIndexResults(
      specializedRenderer,
      () => unmountComponentAtNode(containerNode)
    );
    return makeMultiIndexResults({ indices, escapeHits });
  } catch (e) {
    throw new Error(usage);
  }
}
