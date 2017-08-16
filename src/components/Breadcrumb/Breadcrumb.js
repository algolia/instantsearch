import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import autoHideContainerHOC from "../../decorators/autoHideContainer.js";

const itemsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
    count: PropTypes.number
  })
);

class Breadcrumb extends PureComponent {
  static propTypes = {
    canRefine: PropTypes.bool,
    createURL: PropTypes.func,
    items: itemsPropType,
    refine: PropTypes.func.isRequired,
    rootURL: PropTypes.string,
    separator: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    translate: PropTypes.func
  };

  render() {
    const { createURL, items, refine, translate } = this.props;
    // console.log("canRefine", this.props.canRefine);
    // console.log("canRefine from BC react", canRefine);
    console.log("items", items);

    const breadcrumb = items.map((item, idx) => {
      const isLast = idx === items.length - 1;

      const separator = isLast ? "" : this.props.separator;
      return (
        <span key={idx}>
          <span onClick={() => console.log("onClick", item.value)}>
            <span>
              {item.name} ({item.count})
            </span>
          </span>
          <span>
            {separator}
          </span>
        </span>
      );
    });
    console.log("Breadcrumb", breadcrumb);
    return (
      <pre>
        {breadcrumb}
      </pre>
    );
  }
}

export default Breadcrumb;
