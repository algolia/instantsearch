import React from "react";
import ReactDOM from "react-dom";
import cx from "classnames";

import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import defaultTemplates from "./defaultTemplates.js";

import { connectBreadcrumb } from "../../connectors";
import {
  bemHelper,
  getContainerNode,
  prepareTemplateProps
} from "../../lib/utils";

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
  cssClasses,
  separator,
  renderState,
  rootURL,
  transformData,
  templates,
  containerNode
}) => (
  { items, refine, canRefine, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    console.log("default templates", defaultTemplates);

    renderState.templateProps = prepareTemplateProps({
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
      defaultTemplates
    });
    console.log("renderstate", renderState);
    return;
  }

  // const shouldAutoHideContainer = autoHideContainer && items.length === 0;
  // with canRefine
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
    templates = defaultTemplates,
    cssClasses: userCssClasses = {}
  } = {}
) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem("root"), userCssClasses.root),
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
    templates,
    renderState: {}
  });

  try {
    const makeBreadcrumb = connectBreadcrumb(specializedRenderer);
    return makeBreadcrumb({ attributes });
  } catch (e) {
    throw new Error(usage);
  }
}
