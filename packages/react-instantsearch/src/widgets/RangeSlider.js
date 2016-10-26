import connectRange from '../connectors/connectRange.js';
import React from 'react';
/**
 * Since a lot of sliders already exists, we did not include one by default.
 * However you can easily connect to react-instantsearch an existing one
 * using the [connectRange connector](/HOC/Range.html).
 *
 * @name RangeSlider
 * @kind component
 * @category widget
 * @example
 *
 * //Here's an example showing how to connect the airbnb rheostat slider to react-instantsearch using the
 * //range connector
 *
 * import React, {PropTypes} from 'react';
 * import {connectRange} from 'react-instantsearch/connectors';
 * import Rheostat from 'rheostat';
 *
 * const ConnectedRange = connectRange(({min, max, value, refine}) => {
  const updateValue = sliderState => {
    if (sliderState.values[0] !== min || sliderState.values[1] !== max) {
      refine({min: sliderState.values[0], max: sliderState.values[1]});
    }
  };

  return (
    <div>
      <Rheostat
        min={min}
        max={max}
        values={[value.min, value.max]}
        onChange={updateValue}
      />
      <div>
        <span>{value.min}</span>
        <span>{value.max}</span>
      </div>
    </div>
  );
});

 */
export default connectRange(() =>
  <div>We do not provide any Slider, see the documentation to learn how to connect one easily:
    <a target="_blank" href="https://community.algolia.com/instantsearch.js/react/component/RangeSlider.html">
      https://community.algolia.com/instantsearch.js/react/component/RangeSlider.html
    </a>
  </div>
);
