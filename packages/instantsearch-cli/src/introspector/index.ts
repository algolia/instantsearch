import { algoliasearch } from 'algoliasearch';

import type { AlgoliaCredentials } from '../types';

const PROBE_INDEX = '__instantsearch_cli_probe__';

export type VerifyResult =
  | { ok: true }
  | { ok: false; code: 'credentials_invalid'; message: string };

export async function verifyCredentials({
  appId,
  searchApiKey,
}: AlgoliaCredentials): Promise<VerifyResult> {
  const client = algoliasearch(appId, searchApiKey);
  try {
    await client.searchSingleIndex({
      indexName: PROBE_INDEX,
      searchParams: { hitsPerPage: 0 },
    });
    return { ok: true };
  } catch (err) {
    const status = (err as { status?: number } | null)?.status;
    if (status === 404) {
      // Probe index doesn't exist, but credentials were accepted.
      return { ok: true };
    }
    return {
      ok: false,
      code: 'credentials_invalid',
      message:
        'Algolia rejected the app ID / search API key pair. Double-check your credentials and try again.',
    };
  }
}

export type IntrospectParams = AlgoliaCredentials & { indexName: string };

export type CommonFailureCode =
  | 'credentials_invalid'
  | 'index_not_found'
  | 'network_error';

export type RecordsFailureCode = CommonFailureCode | 'index_empty';

export type RecordsResult =
  | {
      ok: true;
      attributes: string[];
      imageCandidates: string[];
    }
  | { ok: false; code: RecordsFailureCode; message: string };

function sortImageCandidates(candidates: string[]): string[] {
  const imageLike = /image|img/i;
  return [...candidates].sort((a, b) => {
    const aHit = imageLike.test(a);
    const bHit = imageLike.test(b);
    if (aHit && !bHit) return -1;
    if (!aHit && bHit) return 1;
    return 0;
  });
}

function errorStatus(err: unknown): number | undefined {
  return (err as { status?: number } | null)?.status;
}

async function withRetry<T>(op: () => Promise<T>): Promise<T> {
  try {
    return await op();
  } catch (err) {
    const status = errorStatus(err);
    // Retry once on transport/5xx; never on deterministic 4xx client errors.
    if (status !== undefined && status < 500) throw err;
    return await op();
  }
}

type CommonFailure<Code extends string = CommonFailureCode> = {
  ok: false;
  code: Code;
  message: string;
};

function mapAlgoliaError<Code extends string = never>(
  err: unknown,
  indexName: string,
  options: { forbiddenCode?: Code; forbiddenMessage?: string } = {}
): CommonFailure<CommonFailureCode | Code> {
  const status = errorStatus(err);
  if (status === 404) {
    return {
      ok: false,
      code: 'index_not_found',
      message: `Index '${indexName}' was not found on this application.`,
    };
  }
  if (status === 403 && options.forbiddenCode) {
    return {
      ok: false,
      code: options.forbiddenCode,
      message: options.forbiddenMessage ?? `Forbidden on index '${indexName}'.`,
    };
  }
  if (status === 401 || status === 403) {
    return {
      ok: false,
      code: 'credentials_invalid',
      message:
        'Algolia rejected the app ID / search API key pair. Double-check your credentials and try again.',
    };
  }
  return {
    ok: false,
    code: 'network_error',
    message:
      'Could not reach Algolia after retrying once. Check your network connection and try again.',
  };
}

async function runSearch(
  params: IntrospectParams,
  searchParams: Record<string, unknown>
): Promise<
  | { ok: true; response: { hits: Array<Record<string, unknown>>; facets?: Record<string, unknown> } }
  | CommonFailure
> {
  const client = algoliasearch(params.appId, params.searchApiKey);
  try {
    const response = (await withRetry(() =>
      client.searchSingleIndex({
        indexName: params.indexName,
        searchParams,
      })
    )) as { hits: Array<Record<string, unknown>>; facets?: Record<string, unknown> };
    return { ok: true, response };
  } catch (err) {
    return mapAlgoliaError(err, params.indexName);
  }
}

export async function introspectRecords(
  params: IntrospectParams
): Promise<RecordsResult> {
  const result = await runSearch(params, { hitsPerPage: 1 });
  if (!result.ok) return result;

  const { hits } = result.response;
  if (hits.length === 0) {
    return {
      ok: false,
      code: 'index_empty',
      message: `Index '${params.indexName}' is empty. Populate it with at least one record before scaffolding schema-driven widgets.`,
    };
  }

  const firstHit = hits[0]!;
  const highlighted = Object.keys(
    (firstHit._highlightResult as Record<string, unknown>) ?? {}
  );
  const imageCandidates = Object.entries(firstHit)
    .filter(
      ([key, value]) =>
        typeof value === 'string' &&
        !/\s/.test(value) &&
        !highlighted.includes(key) &&
        key !== 'objectID'
    )
    .map(([key]) => key);

  return {
    ok: true,
    attributes: highlighted,
    imageCandidates: sortImageCandidates(imageCandidates),
  };
}

export type FacetsFailureCode = CommonFailureCode | 'index_has_no_facets';

export type FacetsResult =
  | { ok: true; facets: string[] }
  | { ok: false; code: FacetsFailureCode; message: string };

export async function introspectFacets(
  params: IntrospectParams
): Promise<FacetsResult> {
  const result = await runSearch(params, { hitsPerPage: 0, facets: ['*'] });
  if (!result.ok) return result;

  const facets = Object.keys(result.response.facets ?? {});
  if (facets.length === 0) {
    return {
      ok: false,
      code: 'index_has_no_facets',
      message: `Index '${params.indexName}' has no attributes configured for faceting.`,
    };
  }
  return { ok: true, facets };
}

export type ReplicasFailureCode =
  | CommonFailureCode
  | 'settings_forbidden'
  | 'no_replicas';

export type ReplicasResult =
  | { ok: true; replicas: string[] }
  | { ok: false; code: ReplicasFailureCode; message: string };

export async function introspectReplicas(
  params: IntrospectParams
): Promise<ReplicasResult> {
  const client = algoliasearch(params.appId, params.searchApiKey);

  let settings: { replicas?: string[] };
  try {
    settings = (await withRetry(() =>
      client.getSettings({ indexName: params.indexName })
    )) as { replicas?: string[] };
  } catch (err) {
    return mapAlgoliaError(err, params.indexName, {
      forbiddenCode: 'settings_forbidden' as const,
      forbiddenMessage:
        "The provided search API key lacks the 'settings' ACL. Pass --sort-by-replicas explicitly or use a key with settings access.",
    });
  }

  const replicas = settings.replicas ?? [];
  if (replicas.length === 0) {
    return {
      ok: false,
      code: 'no_replicas',
      message: `Index '${params.indexName}' has no replicas configured. SortBy needs at least one replica to offer sort options.`,
    };
  }
  return { ok: true, replicas };
}
