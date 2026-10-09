import EventEmitter from '@algolia/events';

import { defer, noop, now } from './utils';

import type {
  IndexWidget,
  Middleware,
  MiddlewareDefinition,
  RenderState,
  UiState,
  Widget,
} from '../types';
import type InstantSearch from './InstantSearch';
import type { InstantSearchStatus } from './InstantSearch';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

export type InstantSearchBaseOptions<TClient = any> = {
  /**
   * What the credentials are read from: a search client, or any object with
   * `appId` and `apiKey`.
   */
  client: TClient;
  indexName: string;
  /**
   * The root the widgets are added to. It is given by the implementation: a
   * real `index()` widget when searching, a plain widget container otherwise.
   */
  mainIndex: IndexWidget;
};

/**
 * What every instance has, whether it searches or not: the credentials, the
 * widget lifecycle, the middleware lifecycle, the shared `renderState` and
 * scheduled renders.
 *
 * It knows nothing about the search helper, the index tree, routing or UI
 * state: those are added by `InstantSearch`, which extends this class. It is the
 * smallest thing that can host widgets that don't search (`chat`,
 * `chatTrigger`), and every module (Insights, routing, …) is added by the user.
 *
 * The hooks (`_afterInit`, `_afterStart`, `_disposeSearch`, `_render`) are the
 * places an implementation plugs its own behavior into the lifecycle.
 */
export class InstantSearchBase<
  TUiState extends UiState = UiState,
  TClient = any,
> extends EventEmitter {
  public client: TClient;
  public indexName: string;
  public mainIndex: IndexWidget;
  public mainHelper: AlgoliaSearchHelper | null = null;
  public started = false;
  public templatesConfig: Record<string, unknown> = {
    helpers: {},
    compileOptions: {},
  };
  public renderState: RenderState = {};
  public middleware: Array<{
    creator: Middleware<TUiState>;
    instance: MiddlewareDefinition<TUiState>;
  }> = [];
  public _createdAt: number = now();
  public _initialUiState: TUiState = {} as TUiState;

  // What the widgets and modules read from an instance, whether it searches
  // or not. Without a search side they stay at these defaults: nothing ever
  // loads, fails or has a UI state of its own. `InstantSearch` overrides them.
  public status: InstantSearchStatus = 'idle';
  public error: Error | undefined = undefined;
  public sendEventToInsights: (event: any) => void = noop;
  public scheduleSearch: () => void = noop;

  public constructor({
    client,
    indexName,
    mainIndex,
  }: InstantSearchBaseOptions<TClient>) {
    super();

    // prevent `render` event listening from causing a warning
    this.setMaxListeners(100);

    this.client = client;
    this.indexName = indexName;
    this.mainIndex = mainIndex;
  }

  /**
   * Hooks a middleware into the lifecycle.
   */
  public use(...middleware: Array<Middleware<TUiState>>): this {
    const newMiddlewareList = middleware.map((fn) => {
      const newMiddleware = {
        $$type: '__unknown__',
        $$internal: false,
        subscribe: noop,
        started: noop,
        unsubscribe: noop,
        onStateChange: noop,
        ...fn({
          instantSearchInstance: this as unknown as InstantSearch<
            UiState,
            UiState
          >,
        }),
      };
      this.middleware.push({
        creator: fn,
        instance: newMiddleware,
      });
      return newMiddleware;
    });

    // If the instance has already started, we directly subscribe the
    // middleware so they're notified of changes.
    if (this.started) {
      newMiddlewareList.forEach((m) => {
        m.subscribe();
        m.started();
      });
    }

    return this;
  }

  /**
   * Removes a middleware from the lifecycle.
   */
  public unuse(...middlewareToUnuse: Array<Middleware<TUiState>>): this {
    this.middleware
      .filter((m) => middlewareToUnuse.includes(m.creator))
      .forEach((m) => m.instance.unsubscribe());

    this.middleware = this.middleware.filter(
      (m) => !middlewareToUnuse.includes(m.creator)
    );

    return this;
  }

  public getUiState(): TUiState {
    return { [this.mainIndex.getIndexId()]: {} } as unknown as TUiState;
  }

  public setUiState(
    _uiState: TUiState | ((previousUiState: TUiState) => TUiState),
    _callOnStateChange?: boolean,
    _onApply?: (notifiedUiState: TUiState) => void
  ): void {}

  public refresh() {}

  /**
   * Adds widgets, before or after `start()`.
   */
  public addWidgets(
    widgets: Array<Widget | IndexWidget | Array<IndexWidget | Widget>>
  ) {
    this.mainIndex.addWidgets(widgets);

    return this;
  }

  /**
   * Removes widgets.
   */
  public removeWidgets(widgets: Array<Widget | IndexWidget | Widget[]>) {
    this.mainIndex.removeWidgets(widgets);

    return this;
  }

  /**
   * Initializes the widgets and starts the middleware.
   */
  public start() {
    if (this.started) {
      return;
    }

    this._beforeStart?.();

    this.middleware.forEach(({ instance }) => {
      instance.subscribe();
    });

    this.mainIndex.init({
      instantSearchInstance: this as unknown as InstantSearch<UiState, UiState>,
      parent: null,
      uiState: this._initialUiState,
    });

    this._afterInit?.();

    // track we started, to init widgets directly after add
    this.started = true;

    this.middleware.forEach(({ instance }) => {
      instance.started();
    });

    this._afterStart?.();
  }

  /**
   * Removes all widgets.
   */
  public dispose(): void {
    this.scheduleRender.cancel();

    this.removeWidgets(this.mainIndex.getWidgets());
    this.mainIndex.dispose();

    // A disposed instance needs to set started as false, otherwise it can not
    // be restarted at a later point.
    this.started = false;

    this.removeAllListeners();
    this._disposeSearch?.();

    this.middleware.forEach(({ instance }) => {
      instance.unsubscribe();
    });
  }

  public scheduleRender = defer(
    (shouldResetStatus: boolean = true) => {
      this._beforeRender?.(shouldResetStatus);

      this.mainIndex.render({
        instantSearchInstance: this as unknown as InstantSearch<
          UiState,
          UiState
        >,
      });

      this.emit('render');
    },
    // Renders scheduled in the same microtask collapse into one run, so the
    // status reset accumulates instead of letting the first caller decide: a
    // render scheduled for a reason unrelated to the search must not cancel the
    // one a search result asks for, or it would strand the status on `loading`.
    ([shouldResetStatus = true], [nextShouldResetStatus = true]): [boolean] => [
      shouldResetStatus || nextShouldResetStatus,
    ]
  );

  // Hooks an implementation can define to plug into the lifecycle. They are
  // optional so that the base stays free of them.
  public _beforeStart?(): void;

  public _afterInit?(): void;

  public _afterStart?(): void;

  public _disposeSearch?(): void;

  public _beforeRender?(shouldResetStatus: boolean): void;
}
