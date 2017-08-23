import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import autoHideContainerHOC from "../../decorators/autoHideContainer.js";
import headerFooterHOC from "../../decorators/headerFooter.js";

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
    const {
      createURL,
      items,
      refine,
      translate,
      cssClasses,
      canRefine
    } = this.props;
    console.log("canRefine", this.props.canRefine);
    console.log("canRefine from BC react", canRefine);
    // console.log("items", items);

    /* 
    const rootPath = canRefine
      ? <span>
          <span onClick={isLast ? null : () => refine(item.value)}>
            <span className={cssClasses.labelRoot}>
              {item.name}
            </span>
            <span className={cssClasses.count}>
              {item.count}
            </span>
          </span>
          <span className={cssClasses.separator}>
            {separator}
          </span>
        </span>
      : null;
    */

    const breadcrumb = items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      const separator = isLast ? "" : this.props.separator;
      const itemCssClass = !isLast ? cssClasses.item : cssClasses.itemDisabled;
      return (
        <span key={idx}>
          <span
            className={itemCssClass}
            onClick={
              isLast
                ? null
                : () =>
                    refine(
                      items.length - 1 === idx
                        ? item.value
                        : items[idx + 1].value
                    )
            }
          >
            <span className={cssClasses.label}>
              {item.name}
            </span>
            <span className={cssClasses.count}>
              {item.count}
            </span>
          </span>
          <span className={cssClasses.separator}>
            {separator}
          </span>
        </span>
      );
    });
    console.log("Breadcrumb", breadcrumb);
    return (
      //add rootPath
      <div>
        {breadcrumb}
      </div>
    );
  }
}

export default autoHideContainerHOC(headerFooterHOC(Breadcrumb));
// export default Breadcrumb;
