import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import connectMenu from '../../connectors/menu/connectMenu';
import defaultTemplates from './defaultTemplates';
import MenuSelect from '../../components/MenuSelect';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils';

const bem = bemHelper('ais-menu-select');

const renderer = ({
  containerNode,
  cssClasses,
  autoHideContainer,
  renderState,
  templates,
  transformData,
}) => (
  { refine, items, canRefine, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const shouldAutoHideContainer = autoHideContainer && !canRefine;

  ReactDOM.render(
    <MenuSelect
      cssClasses={cssClasses}
      items={items}
      refine={refine}
      templateProps={renderState.templateProps}
      shouldAutoHideContainer={shouldAutoHideContainer}
      canRefine={canRefine}
    />,
    containerNode
  );
};

const usage = `Usage:
menuSelect({
  container,
  attributeName,
  [ sortBy=['name:asc'] ],
  [ limit=10 ],
  [ cssClasses.{root,select,option} ]
  [ templates.{header,item,footer,seeAllOption} ],
  [ transformData.{item} ],
  [ autoHideContainer ]
})`;

export default function menuSelect({
  container,
  attributeName,
  sortBy = ['name:asc'],
  limit = 10,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  transformData,
  autoHideContainer = true,
}) {
  if (!container || !attributeName) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    footer: cx(bem('footer'), userCssClasses.footer),
    select: cx(bem('footer'), userCssClasses.footer),
    option: cx(bem('option'), userCssClasses.option),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    autoHideContainer,
    renderState: {},
    templates,
    transformData,
  });

  try {
    const makeWidget = connectMenu(specializedRenderer);
    return makeWidget({ attributeName, limit, sortBy });
  } catch (e) {
    throw new Error(usage);
  }
}
