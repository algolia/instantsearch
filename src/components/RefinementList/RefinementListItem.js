/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';
import Template from '../Template/Template';

function RefinementListItem({
  className,
  handleClick,
  facetValueToRefine,
  isRefined,
  template,
  templateData,
  templateHelpers,
  subItems,
}) {
  return (
    <li
      className={className}
      onClick={originalEvent => {
        handleClick({
          facetValueToRefine,
          isRefined,
          originalEvent,
        });
      }}
    >
      <Template
        template={template}
        templateHelpers={templateHelpers}
        data={templateData}
      />
      {subItems}
    </li>
  );
}

RefinementListItem.propTypes = {
  facetValueToRefine: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleClick: PropTypes.func.isRequired,
  isRefined: PropTypes.bool.isRequired,
  subItems: PropTypes.object,
  template: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  templateHelpers: PropTypes.object.isRequired,
  templateData: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

export default RefinementListItem;
