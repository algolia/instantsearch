import { action } from '@storybook/addon-actions';
import {
  liteClient as namedConstructor,
  default as defaultConstructor,
} from 'algoliasearch/lite';
import instantsearch from '../../src';
import defaultPlayground from '../playgrounds/default';
import {
  InstantSearch,
  InstantSearchOptions,
  SearchClient,
} from '../../src/types';

const algoliasearch = (namedConstructor || defaultConstructor) as unknown as (
  appId: string,
  apiKey: string
) => SearchClient;

type InstantSearchUMDModule = typeof instantsearch;

export type Playground = (options: {
  search: InstantSearch;
  instantsearch: InstantSearchUMDModule;
  leftPanel: HTMLDivElement;
  rightPanel: HTMLDivElement;
}) => void;

type InstantSearchOptionalParameters = 'searchClient' | 'indexName';

type SearchOptions = Omit<
  InstantSearchOptions,
  InstantSearchOptionalParameters
> &
  Partial<Pick<InstantSearchOptions, InstantSearchOptionalParameters>> & {
    appId?: string;
    apiKey?: string;
    playground?: Playground;
  };

export const withHits =
  (
    storyFn: ({
      container,
      instantsearch,
      search,
    }: {
      container: HTMLElement;
      instantsearch: InstantSearchUMDModule;
      search: InstantSearch;
    }) => void,
    searchOptions?: SearchOptions
  ) =>
  () => {
    const {
      appId = 'latency',
      apiKey = '6be0576ff61c053d5f9a3225e2a90f76',
      indexName = 'instant_search',
      playground = defaultPlayground,
      ...instantsearchOptions
    } = searchOptions || {};

    const searchClient = algoliasearch(appId, apiKey);

    const urlLogger = action('Routing state');
    const search = instantsearch({
      indexName,
      searchClient,
      routing: {
        router: {
          write: (routeState: object) => {
            urlLogger(JSON.stringify(routeState, null, 2));
          },
          read: () => ({}),
          createURL: () => '',
          dispose: () => {},
          onUpdate: () => {},
        },
      },
      ...instantsearchOptions,
    });

    search.addWidgets([
      instantsearch.widgets.configure({
        hitsPerPage: 4,
        attributesToSnippet: ['description:15'],
        snippetEllipsisText: '[…]',
      }),
    ]);

    const containerElement = document.createElement('div');

    // Add the preview container to add the stories in
    const previewElement = document.createElement('div');
    previewElement.classList.add('container', 'container-preview');
    containerElement.appendChild(previewElement);

    // Add the playground container to add widgets into
    const playgroundElement = document.createElement('div');
    playgroundElement.classList.add('container', 'container-playground');
    containerElement.appendChild(playgroundElement);

    const leftPanelPlaygroundElement = document.createElement('div');
    leftPanelPlaygroundElement.classList.add('panel-left');
    playgroundElement.appendChild(leftPanelPlaygroundElement);

    const rightPanelPlaygroundElement = document.createElement('div');
    rightPanelPlaygroundElement.classList.add('panel-right');
    playgroundElement.appendChild(rightPanelPlaygroundElement);

    playground({
      search,
      instantsearch,
      leftPanel: leftPanelPlaygroundElement,
      rightPanel: rightPanelPlaygroundElement,
    });

    storyFn({
      container: previewElement,
      instantsearch,
      search,
    });

    search.start();

    return containerElement;
  };
