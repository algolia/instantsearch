export default function createInstantSearchManager(props: {
  indexName: string;
  initialState: object;
  searchClient: object;
  resultsState?: object;
  stalledSearchDelay?: number;
}): any;
