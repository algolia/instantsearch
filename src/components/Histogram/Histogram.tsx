/** @jsx h */

import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import cx from 'classnames';
import { HistogramItem } from '../../connectors/histogram/connectHistogram';
import { HistogramTemplates } from '../../widgets/histogram/histogram';

export type HistogramComponentCSSClasses = {
  root: string;
};

type Props = {
  cssClasses: HistogramComponentCSSClasses;
  items: HistogramItem[];
  templates: HistogramTemplates;
};

function Line({ items }: { items: HistogramItem[] }) {
  const max = Math.max(...items.map(item => item.count));

  return (
    <polyline
      fill="none"
      stroke="currentColor"
      // eslint-disable-next-line react/no-unknown-property
      vector-effect="non-scaling-stroke"
      points={`0,100 ${items
        .map(({ count }, i) => {
          const height = Math.round(100 * (count / max));
          return [5 + i * 10, 100 - height].join(',');
        })
        .join(' ')} ${items.length * 10},100`}
    />
  );
}

function Area({ items }: { items: HistogramItem[] }) {
  const max = Math.max(...items.map(item => item.count));

  return (
    <polyline
      fill="currentColor"
      stroke="currentColor"
      // eslint-disable-next-line react/no-unknown-property
      vector-effect="non-scaling-stroke"
      points={`0,100 ${items
        .map(({ count }, i) => {
          const height = Math.round(100 * (count / max));
          return [5 + i * 10, 100 - height].join(',');
        })
        .join(' ')} ${items.length * 10},100`}
    />
  );
}

function PathLine({ items }: { items: HistogramItem[] }) {
  const max = Math.max(...items.map(item => item.count));

  return (
    <path
      fill="none"
      stroke="currentColor"
      // eslint-disable-next-line react/no-unknown-property
      vector-effect="non-scaling-stroke"
      d={`M0,100 ${items
        .map(({ count }, i) => {
          const height = Math.round(100 * (count / max));
          return `L${5 + i * 10},${100 - height}`;
        })
        .join(' ')} L${items.length * 10},100`}
    />
  );
}

function Bar({ items }: { items: HistogramItem[] }) {
  const max = Math.max(...items.map(item => item.count));

  return (
    // TODO: just returning the array should also be fine, but TS didn't allow it
    <Fragment>
      {items.map(({ count, start, end }, i) => {
        const height = Math.round(100 * (count / max));
        return (
          <rect
            key={i}
            fill="currentColor"
            x={0 + i * 10}
            y={100 - height}
            width={10}
            height={height}
          >
            <title>
              {/* TODO: make this a template? */}
              {start}-{end}: {count}
            </title>
          </rect>
        );
      })}
    </Fragment>
  );
}

type Visualization = 'bar' | 'line' | 'area' | 'pathLine';

function Visualization({
  visualization,
  items,
}: {
  visualization: Visualization;
  items: HistogramItem[];
}) {
  switch (visualization) {
    case 'bar': {
      return <Bar items={items} />;
    }
    case 'line': {
      return <Line items={items} />;
    }
    case 'area': {
      return <Area items={items} />;
    }
    case 'pathLine': {
      return <PathLine items={items} />;
    }
    default: {
      return null;
    }
  }
}

function Histogram({ cssClasses, items }: Props) {
  const [visualization, setVisualization] = useState<Visualization>('bar');

  return (
    <div className={cx(cssClasses.root)}>
      {/* TODO: remove select, this is just for demo */}
      <select onChange={e => setVisualization(e.target.value)}>
        <option value="bar">bar</option>
        <option value="line">line</option>
        <option value="pathLine">line (path)</option>
        <option value="area">area</option>
      </select>
      <svg
        viewBox={`0 0 ${items.length * 10} 100`}
        // TODO: move this style somewhere else? It's definitely part of the thing though, becuase it doesn't match up with the slider otherwise
        style={{ height: '4em', width: '100%' }}
        preserveAspectRatio="none"
      >
        <Visualization visualization={visualization} items={items} />
      </svg>
    </div>
  );
}

export default Histogram;
