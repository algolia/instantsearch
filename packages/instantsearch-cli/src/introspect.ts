import path from 'path';

import {
  failureEnvelope,
  formatEnvelope,
  successEnvelope,
} from './envelope';
import { readManifest } from './manifest';

import type { IO } from './io';

const COMMAND = 'introspect';
const MANIFEST_FILENAME = 'instantsearch.json';

type IntrospectOptions = {
  cwd: string;
  json: boolean;
  index?: string;
  appId?: string;
  searchApiKey?: string;
};

type IntrospectData = {
  facets: string[];
  searchableAttributes: string[];
};

type SearchHit = { _highlightResult?: Record<string, unknown> };
type SearchResponse = {
  facets?: Record<string, unknown>;
  hits?: SearchHit[];
};

export async function runIntrospect(
  options: IntrospectOptions,
  io: IO
): Promise<number> {
  if (!options.index) {
    emitFailure(
      io,
      options.json,
      failureEnvelope(COMMAND, 'missing_required_flag', '--index is required.')
    );
    return 1;
  }

  const credentials = resolveCredentials(options);
  if (!credentials.ok) {
    emitFailure(io, options.json, credentials.envelope);
    return 1;
  }

  try {
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(credentials.appId, credentials.searchApiKey);
    const response = (await client.searchSingleIndex({
      indexName: options.index,
      searchParams: {
        query: '',
        facets: ['*'],
        attributesToHighlight: ['*'],
        hitsPerPage: 5,
      },
    })) as SearchResponse;

    emitSuccess(io, options.json, options.index, toIntrospectData(response));
    return 0;
  } catch (error) {
    const code = classifyAlgoliaError(error);
    const message =
      code === 'index_not_found'
        ? `Index "${options.index}" was not found.`
        : code === 'credentials_invalid'
        ? 'Algolia rejected the credentials. Check --app-id and --search-api-key.'
        : describeError(error);
    emitFailure(io, options.json, failureEnvelope(COMMAND, code, message));
    return 1;
  }
}

function toIntrospectData(response: SearchResponse): IntrospectData {
  const searchable = new Set<string>();
  for (const hit of response.hits ?? []) {
    const highlights = hit._highlightResult;
    if (highlights && typeof highlights === 'object') {
      for (const key of Object.keys(highlights)) searchable.add(key);
    }
  }
  return {
    facets: Object.keys(response.facets ?? {}),
    searchableAttributes: Array.from(searchable),
  };
}

function classifyAlgoliaError(
  error: unknown
): 'index_not_found' | 'credentials_invalid' | 'algolia_error' {
  const status = getStatus(error);
  if (status === 404) return 'index_not_found';
  if (status === 401 || status === 403) return 'credentials_invalid';
  return 'algolia_error';
}

function getStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
}

type ResolvedCredentials =
  | { ok: true; appId: string; searchApiKey: string }
  | { ok: false; envelope: ReturnType<typeof failureEnvelope> };

function resolveCredentials(options: IntrospectOptions): ResolvedCredentials {
  // If either flag is set, require both. Don't silently fall back to the manifest
  // when the user has expressed partial intent.
  if (options.appId || options.searchApiKey) {
    if (!options.appId) {
      return {
        ok: false,
        envelope: failureEnvelope(
          COMMAND,
          'missing_required_flag',
          '--app-id is required when --search-api-key is passed.'
        ),
      };
    }
    if (!options.searchApiKey) {
      return {
        ok: false,
        envelope: failureEnvelope(
          COMMAND,
          'missing_required_flag',
          '--search-api-key is required when --app-id is passed.'
        ),
      };
    }
    return {
      ok: true,
      appId: options.appId,
      searchApiKey: options.searchApiKey,
    };
  }

  const manifestPath = path.join(options.cwd, MANIFEST_FILENAME);
  const result = readManifest(manifestPath, { command: COMMAND });
  if (!result.ok) {
    if (result.code === 'not_found') {
      return {
        ok: false,
        envelope: failureEnvelope(
          COMMAND,
          'missing_required_flag',
          'Algolia credentials are required. Pass --app-id and --search-api-key, or run from a project with an instantsearch.json manifest.'
        ),
      };
    }
    return { ok: false, envelope: result };
  }

  return {
    ok: true,
    appId: result.manifest.algolia.appId,
    searchApiKey: result.manifest.algolia.searchApiKey,
  };
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function emitFailure(
  io: IO,
  json: boolean,
  envelope: ReturnType<typeof failureEnvelope>
): void {
  if (json) {
    io.stdout(formatEnvelope(envelope));
  } else {
    io.stderr(`${envelope.message}\n`);
  }
}

function emitSuccess(
  io: IO,
  json: boolean,
  index: string,
  data: IntrospectData
): void {
  const envelope = successEnvelope(COMMAND, { data });
  if (json) {
    io.stdout(formatEnvelope(envelope));
    return;
  }
  io.stdout(`introspect: index ${index}\n`);
  io.stdout(
    `  searchable attributes (${data.searchableAttributes.length}): ${
      data.searchableAttributes.join(', ') || '(none)'
    }\n`
  );
  io.stdout(
    `  facets (${data.facets.length}): ${data.facets.join(', ') || '(none)'}\n`
  );
}
