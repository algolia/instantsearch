import React from 'react';
import ReactDOM from 'react-dom';

import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

import { connectBreadcrumb } from '../../connectors';
import { getContainerNode } from '../../lib/utils';

const usage = `Usage:
breadcrumb({
  container,
  [ separator=' > ' ],
  [ rootURL ],
  [ cssClasses.{root , header, body, footer, list, depth, item, active, link}={} ],
  [ templates.{header, item, footer} ],
  [ transformData.{item} ],
  [ autoHideContainer=true ],
})`;

const renderer = ({
  autoHideContainer,
  separator,
  rootURL,
  transformData,
  containerNode,
}) => ({ items, refine }, isFirstRendering) => {
  if (isFirstRendering) return;

  const shouldAutoHideContainer = autoHideContainer && items.length === 0;

  ReactDOM.render(
    <Breadcrumb
      separator={separator}
      rootURL={rootURL}
      items={items}
      refine={refine}
      shouldAutoHideContainer={shouldAutoHideContainer}
    />,
    containerNode
  );
};

export default function breadcrumb(
  {
    container,
    autoHideContainer = true,
    separator = '>',
    rootURL = null,
    transformData,
  } = {}
) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = renderer({
    autoHideContainer,
    separator,
    rootURL,
    transformData,
    containerNode,
    renderState: {},
  });

  try {
    const makeBreadcrumb = connectBreadcrumb(specializedRenderer);
    return makeBreadcrumb();
  } catch (e) {
    throw new Error(usage);
  }
}
