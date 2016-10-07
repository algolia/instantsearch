import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';
import translatable from '../../core/translatable';

import theme from './RangeRatings.css';

class RangeRatings extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    value: PropTypes.shape({
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
    if (min === this.props.value.min && max === this.props.value.max) {
      this.props.refine('');
    } else {
      this.props.refine({min, max});
    }
  }

  buildItem({max, lowerBound, count, applyTheme, translate, createURL}) {
    const icons = [];
    for (let icon = 0; icon < max; icon++) {
      const iconTheme = icon >= lowerBound ? 'ratingIconEmpty' : 'ratingIcon';
      icons.push(<span {...applyTheme(iconTheme, iconTheme)} key={icon}/>);
    }

    const selected = lowerBound === this.props.value.min &&
      max === this.props.value.max;
    const disabled = !count;

    return (
      <a {...applyTheme(
        lowerBound,
        'ratingLink',
        selected && 'ratingLinkSelected',
        disabled && 'ratingLinkDisabled')}
         key={lowerBound}
         onClick={this.onClick.bind(this, lowerBound, max)}
         href={createURL({lowerBound, max})}
      >
        {icons}
        <span {...applyTheme('ratingLabel', 'ratingLabel')}>{translate('ratingLabel')}</span>
        <span {...applyTheme('ratingCount', 'ratingCount')}> ({count})</span>
      </a>
    );
  }

  render() {
    const {applyTheme, translate, refine, min, max, count, createURL} = this.props;
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
        applyTheme,
        translate,
        createURL,
      }));
    }
    return (
      <div {...applyTheme('root', 'root')}>
        {items}
      </div>
    );
  }
}

export default themeable(theme)(translatable({
  ratingLabel: ' & Up',
})(RangeRatings)
);
