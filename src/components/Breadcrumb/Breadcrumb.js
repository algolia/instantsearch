import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Template from '../Template.js';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';

const itemsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
  }),
);

class Breadcrumb extends PureComponent {
  static propTypes = {
    canRefine: PropTypes.bool,
    createURL: PropTypes.func,
    items: itemsPropType,
    refine: PropTypes.func.isRequired,
    rootURL: PropTypes.string,
    separator: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    templateProps: PropTypes.object.isRequired,
    translate: PropTypes.func,
  };

  render() {
    const {
      createURL,
      items,
      refine,
      translate,
      cssClasses,
      canRefine,
    } = this.props;

    const breadcrumb = items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      let labelClassNames = isLast
        ? [cssClasses.disabledLabel, cssClasses.label]
        : [cssClasses.label];

      labelClassNames = labelClassNames.join(' ');

      return (
        <div key={idx} className={cssClasses.item}>
          <Template
            rootProps={{ className: cssClasses.separator }}
            templateKey="separator"
            {...this.props.templateProps}
          />
          <span
            className={labelClassNames}
            onClick={
              isLast
                ? null
                : () =>
                    refine(
                      items.length - 1 === idx
                        ? item.value
                        : items[idx + 1].value,
                    )
            }
          >
            {item.name}
          </span>
        </div>
      );
    });

    console.log('canRefine', canRefine);
    console.log('items.length', items.length);
    const homeClassNames =
      items.length > 0
        ? [cssClasses.home, cssClasses.item]
        : [cssClasses.disabledLabel, cssClasses.home];
    console.log('homeClassNames => ', homeClassNames);

    return (
      <div className={cssClasses.root}>
        <Template
          templateKey="home"
          {...this.props.templateProps}
          rootProps={{
            className: homeClassNames.join(' '),
            onClick: () => refine(null),
          }}
        />
        {breadcrumb}
      </div>
    );
  }
}

export default autoHideContainerHOC(Breadcrumb);
