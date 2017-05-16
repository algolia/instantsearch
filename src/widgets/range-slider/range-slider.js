import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Slider from '../../components/Slider/Slider.js';
import connectRangeSlider from '../../connectors/range-slider/connectRangeSlider.js';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';

const defaultTemplates = {
  header: '',
  footer: '',
};

const bem = bemHelper('ais-range-slider');

const renderer = ({
  containerNode,
  cssClasses,
  pips,
  step,
  tooltips,
  autoHideContainer,
  collapsible,
  renderState,
  templates,
}) => ({
  refine,
  range: {min, max},
  start,
  instantSearchInstance,
}, isFirstRendering) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const shouldAutoHideContainer = autoHideContainer && min === max;

  const minValue = start[0] === -Infinity ? min : start[0];
  const maxValue = start[1] === Infinity ? max : start[1];

  ReactDOM.render(
    <Slider
      cssClasses={ cssClasses }
      refine={ refine }
      min={ min }
      max={ max }
      values={ [minValue, maxValue] }
      tooltips={ tooltips }
      step={ step }
      pips={ pips }
      shouldAutoHideContainer={ shouldAutoHideContainer }
      collapsible={ collapsible }
      templateProps={ renderState.templateProps }
    />,
    containerNode
  );
};

const usage = `Usage:
rangeSlider({
  container,
  attributeName,
  [ min ],
  [ max ],
  [ pips = true ],
  [ step = 1 ],
  [ precision = 2 ]
});
`;

export default function rangeSlider({
  container,
  attributeName,
  min,
  max,
  templates,
  cssClasses: userCssClasses = {},
  step = 1,
  pips = true,
  precision = 2,
  tooltips = true,
  autoHideContainer = true,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
  };

  const specializedRenderer = renderer({
    containerNode,
    step,
    pips,
    tooltips,
    renderState: {},
    templates,
    autoHideContainer,
    cssClasses,
  });

  try {
    const makeWidget = connectRangeSlider(specializedRenderer);
    return makeWidget({attributeName, min, max, precision});
  } catch (e) {
    throw new Error(usage);
  }
}
