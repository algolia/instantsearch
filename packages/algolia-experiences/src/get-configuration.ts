import type { Settings } from './get-information';
import type { Block, Configuration } from './types';

const cache = new Map<string, Configuration>();

export function fetchConfiguration(
  id: string,
  settings: Required<Settings>
): Promise<Configuration> {
  if (cache.has(id)) {
    return Promise.resolve(cache.get(id)!);
  }

  return getExperience({ id, ...settings }).then((experience) => {
    cache.set(id, experience);
    return experience;
  });
}

export type Experience = {
  id: string;
  name: string;
  indexName: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
};

const API_BASE = {
  local: 'http://localhost:3000/1',
  beta: 'https://experiences-beta.algolia.com/1',
  prod: 'https://experiences.algolia.com/1',
};

type ApiParams<TEndpointParams> = Required<Settings> & TEndpointParams;

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
  environment,
}: DeleteExperienceParams) {
  return buildRequest({
    appId,
    apiKey,
    environment,
    endpoint: `experiences/${id}`,
    method: 'DELETE',
  });
}

export type GetExperienceParams = ApiParams<Pick<Experience, 'id'>>;
export function getExperience({
  id,
  appId,
  apiKey,
  environment,
}: GetExperienceParams): Promise<Experience> {
  return buildRequest({
    appId,
    apiKey,
    environment,
    endpoint: `experiences/${id}`,
  });
}

export type UpsertExperienceParams = ApiParams<{ experience: Configuration }>;
export function upsertExperience({
  experience,
  appId,
  apiKey,
  environment,
}: UpsertExperienceParams): Promise<Pick<Experience, 'id'>> {
  return buildRequest({
    appId,
    apiKey,
    environment,
    endpoint: `experiences`,
    method: 'POST',
    data: experience,
  });
}

export type ListExperiencesParams = ApiParams<Record<string, never>>;
export function listExperiences({
  appId,
  apiKey,
  environment,
}: ListExperiencesParams): Promise<Experience[]> {
  return buildRequest({
    appId,
    apiKey,
    environment,
    endpoint: 'experiences',
  });
}

function buildRequest({
  appId,
  apiKey,
  environment,
  endpoint,
  method = 'GET',
  data,
}: RequestParams) {
  return fetch(`${API_BASE[environment]}/${endpoint}`, {
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
