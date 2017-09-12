import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import defaultTemplates from './defaultTemplates.js';

import { connectBreadcrumb } from '../../connectors';
import {
  bemHelper,
  getContainerNode,
  prepareTemplateProps,
} from '../../lib/utils';

const bem = bemHelper('ais-breadcrumb');

const usage = `Usage:
breadcrumb({
  container,
  attributes,
  [ separator=' > ' ],
  [ rootURL ],
  [ cssClasses.{root , item, itemDisabled, label, labelRoot, link, linkRoot, count, separator, noRefinement}={} ],
  [ transformData.{item} ],
  [ autoHideContainer=true ],
})`;

const renderer = ({
  autoHideContainer,
  cssClasses,
  separator,
  renderState,
  rootURL,
  transformData,
  templates,
  containerNode,
}) => (
  { items, refine, canRefine, instantSearchInstance },
  isFirstRendering,
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
      defaultTemplates,
    });
    return;
  }

  const shouldAutoHideContainer = autoHideContainer && !canRefine;
  ReactDOM.render(
    <Breadcrumb
      separator={separator}
      rootURL={rootURL}
      items={items}
      refine={refine}
      cssClasses={cssClasses}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
      canRefine={canRefine}
    />,
    containerNode,
  );
};

export default function breadcrumb(
  {
    container,
    attributes,
    autoHideContainer = false,
    separator = ' > ',
    rootURL = null,
    transformData,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
  } = {},
) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem('root'), userCssClasses.root),
    home: cx(bem('home'), userCssClasses.home),
    label: cx(bem('label'), userCssClasses.label),
    disabledLabel: cx(bem('disabledLabel'), userCssClasses.disabledLabel),
    item: cx(bem('item'), userCssClasses.item),
    separator: cx(bem('separator'), userCssClasses.separator),
  };

  const specializedRenderer = renderer({
    autoHideContainer,
    separator,
    cssClasses,
    rootURL,
    transformData,
    containerNode,
    templates,
    renderState: {},
  });

  try {
    const makeBreadcrumb = connectBreadcrumb(specializedRenderer);
    return makeBreadcrumb({ attributes });
  } catch (e) {
    throw new Error(usage);
  }
}
