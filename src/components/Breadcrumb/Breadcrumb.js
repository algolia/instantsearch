import React, { PureComponent } from 'preact-compat';
import PropTypes from 'prop-types';
import Template from '../Template.js';
import panel from '../decorators/panel.js';

const itemsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
  })
);

class Breadcrumb extends PureComponent {
  static propTypes = {
    createURL: PropTypes.func,
    cssClasses: PropTypes.objectOf(PropTypes.string),
    items: itemsPropType,
    refine: PropTypes.func.isRequired,
    separator: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    templateProps: PropTypes.object.isRequired,
    translate: PropTypes.func,
  };

  render() {
    const { createURL, items, refine, cssClasses } = this.props;

    const breadcrumb = items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      const label = isLast ? (
        <a className={`${cssClasses.disabledLabel} ${cssClasses.label}`}>
          {item.name}
        </a>
      ) : (
        <a
          className={cssClasses.label}
          href={createURL(item.value)}
          onClick={e => {
            e.preventDefault();
            refine(item.value);
          }}
        >
          {item.name}
        </a>
      );

      return [
        <Template
          key={item.name + idx}
          rootProps={{ className: cssClasses.separator }}
          templateKey="separator"
          {...this.props.templateProps}
        />,
        label,
      ];
    });

    const homeClassNames =
      items.length > 0
        ? [cssClasses.home, cssClasses.label]
        : [cssClasses.disabledLabel, cssClasses.home, cssClasses.label];

    const homeOnClickHandler = e => {
      e.preventDefault();
      refine(null);
    };

    const homeUrl = createURL(null);

    return (
      <div className={cssClasses.root}>
        <a
          className={homeClassNames.join(' ')}
          href={homeUrl}
          onClick={homeOnClickHandler}
        >
          <Template templateKey="home" {...this.props.templateProps} />
        </a>
        {breadcrumb}
      </div>
    );
  }
}

export default panel(Breadcrumb);
