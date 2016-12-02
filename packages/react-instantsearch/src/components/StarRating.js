import React, {PropTypes, Component} from 'react';
import translatable from '../core/translatable';
import classNames from './classNames.js';

const cx = classNames('StarRating');

class StarRating extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    currentRefinement: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }).isRequired,
    count: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      count: PropTypes.number,
    })).isRequired,
  };

  onClick(min, max, e) {
    e.preventDefault();
    e.stopPropagation();
    if (min === this.props.currentRefinement.min && max === this.props.currentRefinement.max) {
      this.props.refine('');
    } else {
      this.props.refine({min, max});
    }
  }

  buildItem({max, lowerBound, count, translate, createURL}) {
    const selected = lowerBound === this.props.currentRefinement.min &&
      max === this.props.currentRefinement.max;
    const disabled = !count;

    const icons = [];
    for (let icon = 0; icon < max; icon++) {
      const iconTheme = icon >= lowerBound ? 'ratingIconEmpty' : 'ratingIcon';
      icons.push(
        <span
          key={icon}
          {...cx(
          iconTheme,
          selected && `${iconTheme}Selected`,
          disabled && `${iconTheme}Disabled`,
        )}
        />);
    }
    return (
      <a {...cx(
        'ratingLink',
        selected && 'ratingLinkSelected',
        disabled && 'ratingLinkDisabled')}
         disabled={disabled}
         key={lowerBound}
         onClick={this.onClick.bind(this, lowerBound, max)}
         href={createURL({lowerBound, max})}
      >
        {icons}
        <span {...cx(
          'ratingLabel',
          selected && 'ratingLabelSelected',
          disabled && 'ratingLabelDisabled')}>
          {translate('ratingLabel')}
          </span>
        <span> </span>
        <span {...cx(
          'ratingCount',
          selected && 'ratingCountSelected',
          disabled && 'ratingCountDisabled')}>
          {count}
        </span>
      </a>
    );
  }

  render() {
    const {translate, refine, min, max, count, createURL} = this.props;
    const items = [];
    for (let i = max; i >= min; i--) {
      const itemCount = count.reduce((acc, item) => {
        if (item.value >= i) acc = acc + item.count;
        return acc;
      }, 0);
      items.push(this.buildItem({
        lowerBound: i,
        max,
        refine,
        count: itemCount,
        translate,
        createURL,
      }));
    }
    return (
      <div {...cx('root')}>
        {items}
      </div>
    );
  }
}

export default translatable({
  ratingLabel: ' & Up',
})(StarRating);
