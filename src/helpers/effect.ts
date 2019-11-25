import { RendererOptions } from '../types';

type Runner<TParams> = (params: TParams) => Unsubcriber;
type Unsubcriber = () => void;
type Compare<TParams> = (prevParams: TParams, nextparams: TParams) => boolean;

export interface Effect<TParams> {
  $$type: 'ais.effect';
  run: Runner<TParams>;
  compare: Compare<TParams>;
}

export function effect<TParams>(
  run: Runner<TParams>,
  compare: Compare<TParams>
): Effect<TParams> {
  return {
    $$type: 'ais.effect',
    run,
    compare,
  };
}

export function createEffectHandler<TParams extends RendererOptions>(
  effects: Effect<TParams>[]
) {
  let prevParams: TParams | null = null;
  const unsubscribers: Unsubcriber[] = [];

  return function handleEffects(nextParams: TParams) {
    if (prevParams === null) {
      effects.forEach(effect => {
        unsubscribers.push(effect.run(nextParams));
      });
    } else {
      effects.forEach((effect, index) => {
        if (!effect.compare(prevParams!, nextParams)) {
          unsubscribers[index]();
          unsubscribers[index] = effect.run(nextParams);
        }
      });
    }

    prevParams = nextParams;

    return function unsubscribeEffects() {
      unsubscribers.forEach(unsubscriber => {
        unsubscriber();
      });
    };
  };
}
