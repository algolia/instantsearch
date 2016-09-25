import React, {PropTypes, Component} from 'react';
import {sortedIndex} from 'lodash';

function lerp(a, b, t) {
  return a + t * (b - a);
}

function inverseLerp(a, b, c) {
  return (c - a) / (b - a);
}

export default class Slider extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    value: PropTypes.arrayOf(PropTypes.number).isRequired,
    onStart: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    onEnd: PropTypes.func,
  };

  static defaultProps = {
    onStart: () => {},
    onEnd: () => {},
  };

  constructor() {
    super();

    this.state = {
      activeIdx: null,
    };
  }

  onMouseDown = e => {
    if (e.button !== 0) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.onStart(e.pageX);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  onMouseMove = e => {
    e.preventDefault();
    e.stopPropagation();
    this.onChange(e.pageX);
  };

  onMouseUp = e => {
    e.preventDefault();
    e.stopPropagation();
    this.onStop(e.pageX);
  };

  getPos = x => {
    const rect = this.node.getBoundingClientRect();
    return Math.max(0, Math.min(1, inverseLerp(rect.left, rect.right, x)));
  };

  setPos = (idx, t) => {
    const {min, max, value} = this.props;
    const nextValue = value.slice();
    const v = lerp(min, max, t);
    nextValue.splice(idx, 1);
    const newIdx = sortedIndex(nextValue, v);
    nextValue.splice(newIdx, 0, v);
    this.props.onChange(nextValue);
  }

  onStart = x => {
    const {min, max, value} = this.props;
    const t = this.getPos(x);
    const offsets = value.map(v => inverseLerp(min, max, v));
    const insertIdx = sortedIndex(offsets, t);
    let closestValueIdx;
    if (insertIdx === 0) {
      closestValueIdx = 0;
    } else if (insertIdx === offsets.length) {
      closestValueIdx = offsets.length - 1;
    } else if (offsets[insertIdx] - t < t - offsets[insertIdx - 1]) {
      closestValueIdx = insertIdx;
    } else {
      closestValueIdx = insertIdx - 1;
    }
    this.props.onStart();
    this.setPos(closestValueIdx, t);
    this.setState({
      activeIdx: closestValueIdx,
    });
  };

  onChange = x => {
    this.setPos(this.state.activeIdx, this.getPos(x));
  };

  onStop = x => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.setPos(this.state.activeIdx, this.getPos(x));
    this.props.onEnd();
    this.setState({
      activeIdx: null,
    });
  };

  onRef = node => {
    this.node = node;
  };

  render() {
    const {applyTheme, translate, min, max, value} = this.props;
    const {activeIdx} = this.state;

    const offsets = value.map(v => inverseLerp(min, max, v) * 100);

    const handles = offsets.map((offset, i) =>
      <div // eslint-disable-line react/jsx-key, automatically done by themeable
        {...applyTheme(i, 'handle', i === activeIdx && 'handle_active')}
        style={{
          left: `${offset}%`,
        }}
      >
        <div {...applyTheme('handleDot', 'handleDot')} />
        <div {...applyTheme('handleTooltip', 'handleTooltip')}>
          {translate('value', value[i])}
        </div>
      </div>
    );

    const offsetsWithMinMax = [0].concat(offsets).concat([100]);

    const tracks = offsetsWithMinMax.slice(0, -1).map((offset, i) =>
      <div // eslint-disable-line react/jsx-key, automatically done by themeable
        {...applyTheme(i, 'track')}
        style={{
          width: `${offsetsWithMinMax[i + 1] - offset}%`,
        }}
      />
    );

    return (
      <div
        {...applyTheme('root', 'root')}
        ref={this.onRef}
        onMouseDown={this.onMouseDown}
      >
        <div {...applyTheme('tracks', 'tracks')}>
          {tracks}
        </div>
        <div {...applyTheme('bounds', 'bounds')}>
          <div {...applyTheme('boundMin', 'bound', 'boundMin')}>
            <div>{translate('value', min)}</div>
          </div>
          <div {...applyTheme('boundMax', 'bound', 'boundMax')}>
            <div>{translate('value', max)}</div>
          </div>
        </div>
        <div {...applyTheme('handles', 'handles')}>
          {handles}
        </div>
      </div>
    );
  }
}
