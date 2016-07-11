import React, {PropTypes, Component} from 'react';
import themeable from 'react-themeable';

class PaginationLink extends Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    ariaLabel: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    pageNumber: PropTypes.number.isRequired,
    url: PropTypes.string.isRequired,
  };

  onClick = this.props.onClick.bind(null, this.props.pageNumber);

  renderLink() {
    const {label, ariaLabel, url, isActive, theme} = this.props;
    const th = themeable(theme);

    return (
      <a
        href={url}
        aria-label={ariaLabel}
        onClick={this.onClick}
        {...th('link', 'link')}
      >
        {label}
      </a>
    );
  }

  renderDisabled() {
    const {label, ariaLabel, theme} = this.props;
    const th = themeable(theme);

    return (
      <span
        aria-label={ariaLabel}
        {...th('link', 'link')}
      >
        {label}
      </span>
    );
  }

  render() {
    const {isActive, isDisabled, theme} = this.props;
    const th = themeable(theme);

    // "Enable" the element, by making it a link
    const element = isDisabled ? this.renderDisabled() : this.renderLink();

    return (
      <li
        {...th(
          'item',
          'item',
          isActive && 'itemActive',
          isDisabled && 'itemDisabled'
        )}
      >
        {element}
      </li>
    );
  }
}

PaginationLink.propTypes = {
};

export default PaginationLink;
