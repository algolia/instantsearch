type Render<TParams> = (params: TParams) => void;
type Compare<TParams> = (prevParams: TParams, nextparams: TParams) => boolean;

export interface MemoRenderer<TParams> {
  $$type: 'ais.memo';
  render: Render<TParams>;
  compare(prevParams: TParams, nextParams: TParams): boolean;
}

export function memo<TParams>(
  render: Render<TParams>,
  compare: Compare<TParams>
) {
  return {
    $$type: 'ais.memo',
    render,
    compare,
  };
}

function isMemoRenderer<TParams>(renderer): renderer is MemoRenderer<TParams> {
  return renderer.$$type === 'ais.memo';
}

// @TODO: TParams must extend RendererOptions
export function createMemoRender<TParams>(renderer: Render<TParams>) {
  let prevParams: TParams | null = null;

  return function memoRender(nextParams: TParams) {
    if (isMemoRenderer(renderer)) {
      if (!prevParams) {
        renderer.render(nextParams);
      } else if (!renderer.compare(prevParams, nextParams)) {
        renderer.render(nextParams);
      }
    } else {
      renderer(nextParams);
    }

    prevParams = nextParams;
  };
}
