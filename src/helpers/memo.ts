type Render<TParams> = (params: TParams) => void;

export interface MemoRenderer<TParams> {
  $$type: 'ais.memo';
  render: Render<TParams>;
  compare(prevParams: TParams, nextParams: TParams): boolean;
}

interface MemoRender<TParams> {
  render: Render<TParams>;
  params: TParams;
}

function isMemoRenderer<TParams>(renderer): renderer is MemoRenderer<TParams> {
  return renderer.$$type === 'ais.memo';
}

export function createMemoRender<TParams>() {
  let prevParams: TParams | null = null;

  return function memoRender({
    render,
    params: nextParams,
  }: MemoRender<TParams>) {
    const renderer = render as (...args: any[]) => void | MemoRenderer<TParams>;

    if (isMemoRenderer(renderer)) {
      if (!prevParams) {
        renderer.render(nextParams);
      } else if (!renderer.compare(prevParams, nextParams)) {
        console.log('areEqual', renderer.compare(prevParams, nextParams));
        renderer.render(nextParams);
      }
    } else {
      renderer(nextParams);
    }

    prevParams = nextParams;
  };
}

type Compare<TParams> = (prevParams: TParams, nextparams: TParams) => boolean;

export function memo<TParams>(
  renderer: Render<TParams>,
  compare: Compare<TParams>
) {
  return {
    $$type: 'ais.memo',
    render: renderer,
    compare,
  };
}
