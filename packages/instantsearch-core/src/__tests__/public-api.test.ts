import { publicRuntimeExports } from '../../test/publicApi';
import * as publicApi from '../index';
import * as internalApi from '../internal';

import type {
  BaseHit,
  Hit,
  IndexRenderState,
  InsightsClient,
  InstantSearchInstance,
  Middleware,
  Range,
  RatingMenuConnectorParams,
  RatingMenuWidgetDescription,
  Router,
  UiState,
} from '..';

describe('public API', () => {
  test('exports exactly the public runtime names', () => {
    expect(Object.keys(publicApi).sort()).toEqual(
      [...publicRuntimeExports].sort()
    );
  });

  test('does not leak internal names on the root', () => {
    const leaked = Object.keys(internalApi).filter((name) =>
      Object.prototype.hasOwnProperty.call(publicApi, name)
    );

    expect(leaked).toEqual([]);
  });

  test('only exposes the long router and state mapping names', () => {
    expect(publicApi).not.toHaveProperty('history');
    expect(publicApi).not.toHaveProperty('simple');
    expect(publicApi).not.toHaveProperty('singleIndex');
  });

  test('exposes the types users rely on', () => {
    // Compile-time only: type-check fails if a public type disappears.
    type PublicTypes = [
      Hit,
      BaseHit,
      UiState,
      Middleware,
      InsightsClient,
      IndexRenderState,
      Router,
      InstantSearchInstance,
      Range,
      RatingMenuConnectorParams,
      RatingMenuWidgetDescription,
    ];
    const types: PublicTypes | undefined = undefined;

    expect(types).toBeUndefined();
  });
});
