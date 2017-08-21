import React from "react";
import ReactDOM from "react-dom";
import cx from "classnames";

import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";

import { connectBreadcrumb } from "../../connectors";
import { bemHelper, getContainerNode } from "../../lib/utils";

const bem = bemHelper("ais-breadcrumb");

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
  separator,
  rootURL,
  transformData,
  containerNode
}) => ({ items, refine, canRefine }, isFirstRendering) => {
  if (isFirstRendering) return;

  // const shouldAutoHideContainer = autoHideContainer && items.length === 0;
  // with canRefine
  console.log("canRefine from breadcrumb.js", canRefine);
  const shouldAutoHideContainer = autoHideContainer && !canRefine;
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
    attributes,
    autoHideContainer = true,
    separator = " > ",
    rootURL = null,
    transformData,
    cssClasses: userCssClasses = {}
  } = {}
) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem("item"), userCssClasses.item),
    itemDisabled: cx(bem("itemDisabled"), userCssClasses.itemDisabled),
    label: cx(bem("label"), userCssClasses.label),
    labelRoot: cx(bem("labelRoot"), userCssClasses.labelRoot),
    link: cx(bem("link"), userCssClasses.link),
    linkRoot: cx(bem("linkRoot"), userCssClasses.linkRoot),
    count: cx(bem("count"), userCssClasses.count),
    separator: cx(bem("separator"), userCssClasses.separator),
    noRefinement: cx(bem("noRefinement"), userCssClasses.noRefinement)
  };

  const specializedRenderer = renderer({
    autoHideContainer,
    separator,
    cssClasses,
    rootURL,
    transformData,
    containerNode,
    renderState: {}
  });

  try {
    const makeBreadcrumb = connectBreadcrumb(specializedRenderer);
    return makeBreadcrumb({ attributes });
  } catch (e) {
    throw new Error(usage);
  }
}
