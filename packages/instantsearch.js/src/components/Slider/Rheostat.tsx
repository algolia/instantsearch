/**
 * This is a fork of Rheostat for Preact X.
 *
 * @see https://github.com/airbnb/rheostat
 */

/** @jsx h */

import { h, Component, createRef } from 'preact';

import type { ComponentChildren, ComponentType, JSX } from 'preact';

type BoundingBox = {
  height: number;
  left: number;
  top: number;
  width: number;
};

const KEYS = {
  DOWN: 40,
  END: 35,
  ESC: 27,
  HOME: 36,
  LEFT: 37,
  PAGE_DOWN: 34,
  PAGE_UP: 33,
  RIGHT: 39,
  UP: 38,
} as const;
const PERCENT_EMPTY = 0;
const PERCENT_FULL = 100;

function getPosition(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100;
}

function getValue(pos: number, min: number, max: number) {
  const decimal = pos / 100;

  if (pos === 0) {
    return min;
  } else if (pos === 100) {
    return max;
  }

  return Math.round((max - min) * decimal + min);
}

function getClassName(props: Props) {
  const orientation =
    props.orientation === 'vertical'
      ? 'rheostat-vertical'
      : 'rheostat-horizontal';

  return ['rheostat', orientation]
    .concat(props.className!.split(' '))
    .join(' ');
}

function getHandleFor(ev: Event) {
  return Number(
    (ev.currentTarget as HTMLElement).getAttribute('data-handle-key')
  );
}

function killEvent(ev: Event) {
  ev.stopPropagation();
  ev.preventDefault();
}

function Button(props: JSX.IntrinsicElements['button']) {
  return <button {...props} type="button" />;
}

// Preact doesn't have builtin types for Style, JSX.HTMLAttributes['style'] is just object
// maybe migrate to csstype later?
type Style = {
  position?: 'absolute';
  top?: number | string;
  left?: number | string;
  height?: string;
  width?: string;
};

export type PitProps = {
  children: number | string;
  style: Style;
};

export type HandleProps = {
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-disabled': boolean;
  'data-handle-key': number;
  className: 'rheostat-handle';
  key: string;
  onClick: (e: MouseEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onMouseDown?: (e: MouseEvent) => void;
  onTouchStart?: (e: TouchEvent) => void;
  role: 'slider';
  style: JSX.HTMLAttributes['style'];
  tabIndex: number;
};

type Bounds = [min: number, max: number];

type PublicState = {
  max?: number;
  min?: number;
  values: Bounds;
};

type Props = {
  children?: ComponentChildren;
  className?: string;
  disabled?: boolean;
  handle?: ComponentType<HandleProps>;
  max?: number;
  min?: number;
  onClick?: () => void;
  onChange?: (state: PublicState) => void;
  onKeyPress?: () => void;
  onSliderDragEnd?: () => void;
  onSliderDragMove?: () => void;
  onSliderDragStart?: () => void;
  onValuesUpdated?: (state: PublicState) => void;
  orientation?: 'horizontal' | 'vertical';
  pitComponent?: ComponentType<PitProps>;
  pitPoints?: number[];
  progressBar?: ComponentType<JSX.HTMLAttributes>;
  snap?: boolean;
  snapPoints?: number[];
  values?: Bounds;
};

type State = {
  className: string;
  handlePos: Bounds;
  handleDimensions: number;
  mousePos: { x: number; y: number } | null;
  sliderBox: Partial<BoundingBox>;
  slidingIndex: number | null;
  values: Bounds;
};

class Rheostat extends Component<Props, State> {
  public static defaultProps = {
    className: '',
    children: null,
    disabled: false,
    handle: Button,
    max: PERCENT_FULL,
    min: PERCENT_EMPTY,
    onClick: null,
    onChange: null,
    onKeyPress: null,
    onSliderDragEnd: null,
    onSliderDragMove: null,
    onSliderDragStart: null,
    onValuesUpdated: null,
    orientation: 'horizontal',
    pitComponent: null,
    pitPoints: [],
    progressBar: 'div',
    snap: false,
    snapPoints: [],
    values: [PERCENT_EMPTY],
  };

  x = [0, 0].map((y) => y);

  public state: State = {
    className: getClassName(this.props),
    // non-null thanks to defaultProps
    handlePos: this.props.values!.map((value) =>
      getPosition(value, this.props.min!, this.props.max!)
    ) as Bounds,
    handleDimensions: 0,
    mousePos: null,
    sliderBox: {},
    slidingIndex: null,
    // non-null thanks to defaultProps
    values: this.props.values!,
  };

  private rheostat = createRef<HTMLDivElement>();

  public componentWillReceiveProps = (nextProps: Required<Props>) => {
    const { className, disabled, min, max, orientation } = this.props;
    const { values, slidingIndex } = this.state;

    const minMaxChanged = nextProps.min !== min || nextProps.max !== max;

    const valuesChanged =
      values.length !== nextProps.values.length ||
      values.some((value, idx) => nextProps.values[idx] !== value);

    const orientationChanged =
      nextProps.className !== className ||
      nextProps.orientation !== orientation;

    const willBeDisabled = nextProps.disabled && !disabled;

    if (orientationChanged) {
      this.setState({
        className: getClassName(nextProps),
      });
    }

    if (minMaxChanged || valuesChanged) this.updateNewValues(nextProps);

    if (willBeDisabled && slidingIndex !== null) {
      this.endSlide();
    }
  };

  private getPublicState = () => {
    const { min, max } = this.props;
    const { values } = this.state;

    return { max, min, values };
  };

  private getSliderBoundingBox = (): BoundingBox => {
    // only gets called after render, so it will always be defined
    const node = this.rheostat.current!;
    const rect = node.getBoundingClientRect();

    return {
      height: rect.height || node.clientHeight,
      left: rect.left,
      top: rect.top,
      width: rect.width || node.clientWidth,
    };
  };

  private getProgressStyle = (idx: number): Style => {
    const { handlePos } = this.state;

    const value = handlePos[idx];

    if (idx === 0) {
      return this.props.orientation === 'vertical'
        ? { height: `${value}%`, top: 0 }
        : { left: 0, width: `${value}%` };
    }

    const prevValue = handlePos[idx - 1];
    const diffValue = value - prevValue;

    return this.props.orientation === 'vertical'
      ? { height: `${diffValue}%`, top: `${prevValue}%` }
      : { left: `${prevValue}%`, width: `${diffValue}%` };
  };

  private getMinValue = (idx: number) => {
    return this.state.values[idx - 1]
      ? Math.max(this.props.min!, this.state.values[idx - 1])
      : this.props.min;
  };

  private getMaxValue = (idx: number) => {
    return this.state.values[idx + 1]
      ? Math.min(this.props.max!, this.state.values[idx + 1])
      : this.props.max;
  };

  private getHandleDimensions = (ev: Event, sliderBox: BoundingBox) => {
    const handleNode = (ev.currentTarget as HTMLElement) || null;

    if (!handleNode) return 0;

    return this.props.orientation === 'vertical'
      ? ((handleNode.clientHeight / sliderBox.height) * PERCENT_FULL) / 2
      : ((handleNode.clientWidth / sliderBox.width) * PERCENT_FULL) / 2;
  };

  private getClosestSnapPoint = (value: number) => {
    // non-null thanks to defaultProps
    if (!this.props.snapPoints!.length) return value;

    return this.props.snapPoints!.reduce((snapTo, snap) =>
      Math.abs(snapTo - value) < Math.abs(snap - value) ? snapTo : snap
    );
  };

  private getSnapPosition = (positionPercent: number) => {
    if (!this.props.snap) return positionPercent;

    const { max, min } = this.props as Required<Props>;

    const value = getValue(positionPercent, min, max);

    const snapValue = this.getClosestSnapPoint(value);

    return getPosition(snapValue, min, max);
  };

  private getNextPositionForKey = (idx: number, keyCode: number) => {
    const { handlePos, values } = this.state;
    const { max, min, snapPoints } = this.props as Required<Props>;

    const shouldSnap = this.props.snap;

    let proposedValue = values[idx];
    let proposedPercentage = handlePos[idx];
    const originalPercentage = proposedPercentage;
    let stepValue = 1;

    if (max >= 100) {
      proposedPercentage = Math.round(proposedPercentage);
    } else {
      stepValue = 100 / (max - min);
    }

    let currentIndex: number | null = null;

    if (shouldSnap) {
      currentIndex = snapPoints.indexOf(this.getClosestSnapPoint(values[idx]));
    }

    type StepMultiplier = { [key: number]: (value: number) => number };

    const stepMultiplier: StepMultiplier = {
      [KEYS.LEFT]: (v) => v * -1,
      [KEYS.RIGHT]: (v) => v,
      [KEYS.UP]: (v) => v,
      [KEYS.DOWN]: (v) => v * -1,
      [KEYS.PAGE_DOWN]: (v) => (v > 1 ? -v : v * -10),
      [KEYS.PAGE_UP]: (v) => (v > 1 ? v : v * 10),
    };

    if (Object.prototype.hasOwnProperty.call(stepMultiplier, keyCode)) {
      proposedPercentage += stepMultiplier[keyCode](stepValue);

      if (shouldSnap) {
        if (!currentIndex) {
          // nothing happens
        } else if (proposedPercentage > originalPercentage) {
          // move cursor right unless overflow
          if (currentIndex < snapPoints.length - 1) {
            proposedValue = snapPoints[currentIndex + 1];
          }
          // move cursor left unless there is overflow
        } else if (currentIndex > 0) {
          proposedValue = snapPoints[currentIndex - 1];
        }
      }
    } else if (keyCode === KEYS.HOME) {
      proposedPercentage = PERCENT_EMPTY;

      if (shouldSnap) {
        proposedValue = snapPoints[0];
      }
    } else if (keyCode === KEYS.END) {
      proposedPercentage = PERCENT_FULL;

      if (shouldSnap) {
        proposedValue = snapPoints[snapPoints.length - 1];
      }
    } else {
      return null;
    }

    return shouldSnap
      ? getPosition(proposedValue, min, max)
      : proposedPercentage;
  };

  private getNextState = (idx: number, proposedPosition: number) => {
    const { handlePos } = this.state;
    const { max, min } = this.props as Required<Props>;

    const actualPosition = this.validatePosition(idx, proposedPosition);

    const nextHandlePos = handlePos.map((pos, index) =>
      index === idx ? actualPosition : pos
    ) as Bounds;

    return {
      handlePos: nextHandlePos,
      values: nextHandlePos.map((pos) => getValue(pos, min, max)) as Bounds,
    };
  };

  private getClosestHandle = (positionPercent: number) => {
    const { handlePos } = this.state;

    return handlePos.reduce((closestIdx, _node, idx) => {
      const challenger = Math.abs(handlePos[idx] - positionPercent);
      const current = Math.abs(handlePos[closestIdx] - positionPercent);
      return challenger < current ? idx : closestIdx;
    }, 0);
  };

  private setStartSlide = (
    ev: MouseEvent | TouchEvent,
    x: number,
    y: number
  ) => {
    const sliderBox = this.getSliderBoundingBox();

    this.setState({
      handleDimensions: this.getHandleDimensions(ev, sliderBox),
      mousePos: { x, y },
      sliderBox,
      slidingIndex: getHandleFor(ev),
    });
  };

  private startMouseSlide = (ev: MouseEvent) => {
    this.setStartSlide(ev, ev.clientX, ev.clientY);

    document.addEventListener('mousemove', this.handleMouseSlide, false);
    document.addEventListener('mouseup', this.endSlide, false);

    killEvent(ev);
  };

  private startTouchSlide = (ev: TouchEvent) => {
    if (ev.changedTouches.length > 1) return;

    const touch = ev.changedTouches[0];

    this.setStartSlide(ev, touch.clientX, touch.clientY);

    document.addEventListener('touchmove', this.handleTouchSlide, false);
    document.addEventListener('touchend', this.endSlide, false);

    if (this.props.onSliderDragStart) this.props.onSliderDragStart();

    killEvent(ev);
  };

  private handleMouseSlide = (ev: MouseEvent) => {
    if (this.state.slidingIndex === null) return;
    this.handleSlide(ev.clientX, ev.clientY);
    killEvent(ev);
  };

  private handleTouchSlide = (ev: TouchEvent) => {
    if (this.state.slidingIndex === null) return;

    if (ev.changedTouches.length > 1) {
      this.endSlide();
      return;
    }

    const touch = ev.changedTouches[0];

    this.handleSlide(touch.clientX, touch.clientY);
    killEvent(ev);
  };

  private handleSlide = (x: number, y: number) => {
    const { slidingIndex: idx, sliderBox } = this.state;

    const positionPercent =
      this.props.orientation === 'vertical'
        ? ((y - sliderBox.top!) / sliderBox.height!) * PERCENT_FULL
        : ((x - sliderBox.left!) / sliderBox.width!) * PERCENT_FULL;

    this.slideTo(idx!, positionPercent);

    if (this.canMove(idx!, positionPercent)) {
      // update mouse positions
      this.setState({ mousePos: { x, y } });
      if (this.props.onSliderDragMove) this.props.onSliderDragMove();
    }
  };

  private endSlide = () => {
    const idx = this.state.slidingIndex;

    this.setState({ slidingIndex: null });

    document.removeEventListener('mouseup', this.endSlide, false);
    document.removeEventListener('touchend', this.endSlide, false);
    document.removeEventListener('touchmove', this.handleTouchSlide, false);
    document.removeEventListener('mousemove', this.handleMouseSlide, false);

    if (this.props.onSliderDragEnd) this.props.onSliderDragEnd();
    if (this.props.snap) {
      const positionPercent = this.getSnapPosition(this.state.handlePos[idx!]);
      this.slideTo(idx!, positionPercent, () => this.fireChangeEvent());
    } else {
      this.fireChangeEvent();
    }
  };

  private handleClick = (ev: MouseEvent) => {
    if ((ev.target as HTMLDivElement).getAttribute('data-handle-key')) {
      return;
    }

    // Calculate the position of the slider on the page so we can determine
    // the position where you click in relativity.
    const sliderBox = this.getSliderBoundingBox();

    const positionDecimal =
      this.props.orientation === 'vertical'
        ? (ev.clientY - sliderBox.top) / sliderBox.height
        : (ev.clientX - sliderBox.left) / sliderBox.width;

    const positionPercent = positionDecimal * PERCENT_FULL;

    const handleId = this.getClosestHandle(positionPercent);

    const validPositionPercent = this.getSnapPosition(positionPercent);

    // Move the handle there
    this.slideTo(handleId, validPositionPercent, () => this.fireChangeEvent());

    if (this.props.onClick) this.props.onClick();
  };

  private handleKeydown = (ev: KeyboardEvent) => {
    const idx = getHandleFor(ev);

    if (ev.keyCode === KEYS.ESC) {
      (ev.currentTarget as HTMLElement).blur();
      return;
    }

    const proposedPercentage = this.getNextPositionForKey(idx, ev.keyCode);

    if (proposedPercentage === null) return;

    if (this.canMove(idx, proposedPercentage)) {
      this.slideTo(idx, proposedPercentage, () => this.fireChangeEvent());
      if (this.props.onKeyPress) this.props.onKeyPress();
    }

    killEvent(ev);
  };

  // Make sure the proposed position respects the bounds and
  // does not collide with other handles too much.
  private validatePosition = (idx: number, proposedPosition: number) => {
    const { handlePos, handleDimensions } = this.state;

    return Math.max(
      Math.min(
        proposedPosition,
        handlePos[idx + 1] !== undefined
          ? handlePos[idx + 1] - handleDimensions
          : PERCENT_FULL // 100% is the highest value
      ),
      handlePos[idx - 1] !== undefined
        ? handlePos[idx - 1] + handleDimensions
        : PERCENT_EMPTY // 0% is the lowest value
    );
  };

  private validateValues = (proposedValues: Bounds, props: Required<Props>) => {
    const { max, min } = props || this.props;

    return proposedValues.map((value, idx, values) => {
      const realValue = Math.max(Math.min(value, max), min);

      if (values.length && realValue < values[idx - 1]) {
        return values[idx - 1];
      }

      return realValue;
    }) as Bounds;
  };

  public canMove = (idx: number, proposedPosition: number) => {
    const { handlePos, handleDimensions } = this.state;

    if (proposedPosition < PERCENT_EMPTY) return false;
    if (proposedPosition > PERCENT_FULL) return false;

    const nextHandlePosition =
      handlePos[idx + 1] !== undefined
        ? handlePos[idx + 1] - handleDimensions
        : Infinity;

    if (proposedPosition > nextHandlePosition) return false;

    const prevHandlePosition =
      handlePos[idx - 1] !== undefined
        ? handlePos[idx - 1] + handleDimensions
        : -Infinity;

    if (proposedPosition < prevHandlePosition) return false;

    return true;
  };

  public fireChangeEvent = () => {
    const { onChange } = this.props;
    if (onChange) onChange(this.getPublicState());
  };

  public slideTo = (
    idx: number,
    proposedPosition: number,
    onAfterSet?: () => void
  ) => {
    const nextState = this.getNextState(idx, proposedPosition);

    this.setState(nextState, () => {
      const { onValuesUpdated } = this.props;
      if (onValuesUpdated) onValuesUpdated(this.getPublicState());
      if (onAfterSet) onAfterSet();
    });
  };

  public updateNewValues = (nextProps: Required<Props>) => {
    const { slidingIndex } = this.state;

    // Don't update while the slider is sliding
    if (slidingIndex !== null) {
      return;
    }

    const { max, min, values } = nextProps;

    const nextValues = this.validateValues(values, nextProps);

    this.setState(
      {
        handlePos: nextValues.map((value) =>
          getPosition(value, min, max)
        ) as Bounds,
        values: nextValues,
      },
      () => this.fireChangeEvent()
    );
  };

  public render() {
    const {
      children,
      disabled,
      handle: Handle,
      max,
      min,
      orientation,
      pitComponent: PitComponent,
      pitPoints,
      progressBar: ProgressBar,
    } = this.props as Required<Props>; // all required thanks to defaultProps
    const { className, handlePos, values } = this.state;

    return (
      <div
        className={className}
        ref={this.rheostat}
        onClick={disabled ? undefined : this.handleClick}
        style={{ position: 'relative' }}
      >
        <div className="rheostat-background" />
        {handlePos.map((pos, idx) => {
          const handleStyle: Style =
            orientation === 'vertical'
              ? { top: `${pos}%`, position: 'absolute' }
              : { left: `${pos}%`, position: 'absolute' };

          return (
            <Handle
              aria-valuemax={this.getMaxValue(idx)}
              aria-valuemin={this.getMinValue(idx)}
              aria-valuenow={values[idx]}
              aria-disabled={disabled}
              data-handle-key={idx}
              className="rheostat-handle"
              key={`handle-${idx}`}
              onClick={killEvent}
              onKeyDown={disabled ? undefined : this.handleKeydown}
              onMouseDown={disabled ? undefined : this.startMouseSlide}
              onTouchStart={disabled ? undefined : this.startTouchSlide}
              role="slider"
              style={handleStyle}
              tabIndex={0}
            />
          );
        })}

        {handlePos.map((_node, idx, arr) => {
          if (idx === 0 && arr.length > 1) {
            return null;
          }

          return (
            <ProgressBar
              className="rheostat-progress"
              key={`progress-bar-${idx}`}
              style={this.getProgressStyle(idx)}
            />
          );
        })}

        {PitComponent &&
          pitPoints.map((n) => {
            const pos = getPosition(n, min, max);
            const pitStyle: Style =
              orientation === 'vertical'
                ? { top: `${pos}%`, position: 'absolute' }
                : { left: `${pos}%`, position: 'absolute' };

            return (
              <PitComponent key={`pit-${n}`} style={pitStyle}>
                {n}
              </PitComponent>
            );
          })}
        {children}
      </div>
    );
  }
}

export default Rheostat;
