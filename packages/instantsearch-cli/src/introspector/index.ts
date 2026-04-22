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
