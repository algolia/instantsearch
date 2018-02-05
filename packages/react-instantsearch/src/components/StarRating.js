import React, { Component } from 'react';
import PropTypes from 'prop-types';
import translatable from '../core/translatable';
import classNames from './classNames.js';
const cx = classNames('StarRating');

class StarRating extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    currentRefinement: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }),
    count: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        count: PropTypes.number,
      })
    ),
    canRefine: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    canRefine: PropTypes.func,
  };

  componentWillMount() {
    if (this.context.canRefine) this.context.canRefine(this.props.canRefine);
  }

  componentWillReceiveProps(props) {
    if (this.context.canRefine) this.context.canRefine(props.canRefine);
  }

  onClick(min, max, e) {
    e.preventDefault();
    e.stopPropagation();
    if (
      min === this.props.currentRefinement.min &&
      max === this.props.currentRefinement.max
    ) {
      this.props.refine({ min: this.props.min, max: this.props.max });
    } else {
      this.props.refine({ min, max });
    }
  }

  buildItem({
    max,
    lowerBound,
    count,
    translate,
    createURL,
    isLastSelectableItem,
  }) {
    const disabled = !count;
    const isCurrentMinLower = this.props.currentRefinement.min < lowerBound;
    const selected =
      (isLastSelectableItem && isCurrentMinLower) ||
      (!disabled &&
        lowerBound === this.props.currentRefinement.min &&
        max === this.props.currentRefinement.max);

    const icons = [];
    for (let icon = 0; icon < max; icon++) {
      const iconTheme = icon >= lowerBound ? 'ratingIconEmpty' : 'ratingIcon';
      icons.push(
        <span
          key={icon}
          {...cx(
            iconTheme,
            selected && `${iconTheme}Selected`,
            disabled && `${iconTheme}Disabled`
          )}
        />
      );
    }

    // The last item of the list (the default item), should not
    // be clickable if it is selected.
    const isLastAndSelect = isLastSelectableItem && selected;
    const StarsWrapper = isLastAndSelect ? 'div' : 'a';
    const onClickHandler = isLastAndSelect
      ? {}
      : {
          href: createURL({ min: lowerBound, max }),
          onClick: this.onClick.bind(this, lowerBound, max),
        };

    return (
      <StarsWrapper
        {...cx(
          'ratingLink',
          selected && 'ratingLinkSelected',
          disabled && 'ratingLinkDisabled'
        )}
        disabled={disabled}
        key={lowerBound}
        {...onClickHandler}
      >
        {icons}
        <span
          {...cx(
            'ratingLabel',
            selected && 'ratingLabelSelected',
            disabled && 'ratingLabelDisabled'
          )}
        >
          {translate('ratingLabel')}
        </span>
        <span> </span>
        <span
          {...cx(
            'ratingCount',
            selected && 'ratingCountSelected',
            disabled && 'ratingCountDisabled'
          )}
        >
          {count}
        </span>
      </StarsWrapper>
    );
  }

  render() {
    const { min, max, translate, count, createURL, canRefine } = this.props;

    // min & max are always set when there is a results, otherwise it means
    // that we don't want to render anything since we don't have any values.
    const limitMin = min !== undefined && min >= 0 ? min : 0;
    const limitMax = max !== undefined && max >= 0 ? max : -1;
    const inclusiveLength = limitMax - limitMin + 1;
    const safeInclusiveLength = Math.max(inclusiveLength, 0);

    const values = count
      .map(item => ({ ...item, value: parseFloat(item.value) }))
      .filter(item => item.value >= limitMin && item.value <= limitMax);

    const range = new Array(safeInclusiveLength)
      .fill(null)
      .map((_, index) => {
        const element = values.find(item => item.value === limitMax - index);
        const placeholder = { value: limitMax - index, count: 0, total: 0 };

        return element || placeholder;
      })
      .reduce(
        (acc, item, index) =>
          acc.concat({
            ...item,
            total: index === 0 ? item.count : acc[index - 1].total + item.count,
          }),
        []
      );

    const items = range.map((item, index) =>
      this.buildItem({
        lowerBound: item.value,
        count: item.total,
        isLastSelectableItem: range.length - 1 === index,
        max: limitMax,
        translate,
        createURL,
      })
    );

    return <div {...cx('root', !canRefine && 'noRefinement')}>{items}</div>;
  }
}

export default translatable({
  ratingLabel: ' & Up',
})(StarRating);
