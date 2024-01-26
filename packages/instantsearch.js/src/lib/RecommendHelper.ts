import EventEmitter from '@algolia/events';

import type { SearchResponse } from '@algolia/client-search';
import type { RecommendClient, RecommendationsQuery } from '@algolia/recommend';

export type RecommendParams = {
  frequentlyBoughtTogether: Set<string>;
};

export type RecommendHits = SearchResponse['hits'];
export type RecommendResults = Record<string, RecommendHits>;

export default class RecommendHelper extends EventEmitter {
  private client: RecommendClient;
  private queries: Record<string, RecommendParams> = {};

  public lastResults: RecommendResults | null = null;
  public currentResults: RecommendResults | null = null;

  constructor(client: RecommendClient) {
    super();
    this.client = client;
  }

  public register(indexName: string, params: RecommendParams) {
    this.queries[indexName] = params;
  }

  public fetch(): Promise<void> {
    const requests = Object.entries(this.queries).flatMap(
      ([indexName, { frequentlyBoughtTogether }]) =>
        Array.from(frequentlyBoughtTogether).map((objectID: string) => ({
          indexName,
          model: 'bought-together',
          objectID,
        }))
    ) as RecommendationsQuery[];

    return this.client.getRecommendations(requests).then(({ results }) => {
      this.currentResults = Object.fromEntries(
        results.map((result, i) => [requests[i].objectID, result.hits])
      );
      this.emit('result', this.currentResults);
    });
  }
}
