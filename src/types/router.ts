import { UiState } from './ui-state';

/**
 * The router is the part that saves and reads the object from the storage.
 * Usually this is the URL.
 */
export type Router = {
  /**
   * onUpdate Sets an event listener that is triggered when the storage is updated.
   * The function should accept a callback to trigger when the update happens.
   * In the case of the history / URL in a browser, the callback will be called
   * by `onPopState`.
   */
  onUpdate(callback: (route: RouteState) => void): void;

  /**
   * Reads the storage and gets a route object. It does not take parameters,
   * and should return an object
   */
  read(): RouteState;

  /**
   * Pushes a route object into a storage. Takes the UI state mapped by the state
   * mapping configured in the mapping
   */
  write(route: RouteState): void;

  /**
   * Transforms a route object into a URL. It receives an object and should
   * return a string. It may return an empty string.
   */
  createURL(state: RouteState): string;

  /**
   * Called when InstantSearch is disposed. Used to remove subscriptions.
   */
  dispose(): void;
};

/**
 * The state mapping is a way to customize the structure before sending it to the router.
 * It can transform and filter out the properties. To work correctly, the following
 * should be valid for any UiState:
 * `UiState = routeToState(stateToRoute(UiState))`.
 */
export type StateMapping = {
  /**
   * Transforms a UI state representation into a route object.
   * It receives an object that contains the UI state of all the widgets in the page.
   * It should return an object of any form as long as this form can be read by
   * the `routeToState` function.
   */
  stateToRoute(uiState: UiState): RouteState;
  /**
   * Transforms route object into a UI state representation.
   * It receives an object that contains the UI state stored by the router.
   * The format is the output of `stateToRoute`.
   */
  routeToState(routeState: RouteState): UiState;
};

// @TODO: use the generic form of this in routers
export type RouteState = {
  [stateKey: string]: any;
};
