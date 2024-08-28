import type { Settings } from './get-information';
import type { Block, Configuration } from './types';

export function fetchConfiguration(
  ids: string[],
  settings: Settings
): Promise<Configuration[]> {
  return Promise.all(
    ids.map((id) =>
      getExperience({
        id,
        ...settings,
      })
    )
  );
}

export type Experience = {
  id: string;
  name: string;
  indexName: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
};

const LOCAL = false;
const API_BASE = LOCAL
  ? 'http://localhost:3000/1'
  : 'https://experiences-main.platform.algolia.net/1';

type ApiParams<TEndpointParams> = {
  appId: string;
  apiKey: string;
} & TEndpointParams;

type RequestParams = ApiParams<{
  endpoint: string;
  method?: Request['method'];
  data?: Record<string, unknown>;
}>;

export type DeleteExperienceParams = ApiParams<Pick<Experience, 'id'>>;
export function deleteExperience({
  id,
  appId,
  apiKey,
}: DeleteExperienceParams) {
  return buildRequest({
    appId,
    apiKey,
    endpoint: `collections/${id}`,
    method: 'DELETE',
  });
}

export type GetExperienceParams = ApiParams<Pick<Experience, 'id'>>;
export function getExperience({
  id,
  appId,
  apiKey,
}: GetExperienceParams): Promise<Experience> {
  return buildRequest({
    appId,
    apiKey,
    endpoint: `collections/${id}`,
  });
}

export type UpsertExperienceParams = ApiParams<{ experience: Configuration }>;
export function upsertExperience({
  experience,
  appId,
  apiKey,
}: UpsertExperienceParams): Promise<Pick<Experience, 'id'>> {
  return buildRequest({
    appId,
    apiKey,
    endpoint: `collections`,
    method: 'POST',
    data: experience,
  });
}

export type ListExperiencesParams = ApiParams<Record<string, never>>;
export function listExperiences({
  appId,
  apiKey,
}: ListExperiencesParams): Promise<Experience[]> {
  return buildRequest({
    appId,
    apiKey,
    endpoint: 'collections',
  });
}

function buildRequest({
  appId,
  apiKey,
  endpoint,
  method = 'GET',
  data,
}: RequestParams) {
  return fetch(`${API_BASE}/${endpoint}`, {
    method,
    headers: {
      'X-Algolia-Application-ID': appId,
      'X-Algolia-API-Key': apiKey,
    },
    body: data ? JSON.stringify(data) : undefined,
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }

      return res;
    })
    .then((res) => res.json());
}
