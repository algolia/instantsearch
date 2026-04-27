import {
  introspectRecords,
  introspectFacets,
  introspectReplicas,
} from '../introspector';
import { readRootManifest } from '../manifest';
import { success, failure, type Report } from '../reporter';

const COMMAND = 'introspect';

export type IntrospectOptions = {
  projectDir: string;
  indexName: string;
  appId?: string;
  searchApiKey?: string;
};

export async function introspect(options: IntrospectOptions): Promise<Report> {
  const { projectDir, indexName } = options;
  let { appId, searchApiKey } = options;

  if (!appId || !searchApiKey) {
    const manifest = readRootManifest(projectDir);
    if (!manifest) {
      return failure({
        command: COMMAND,
        code: 'not_initialized',
        message:
          'No instantsearch.json found and no --app-id / --search-key provided.',
      });
    }
    appId = manifest.algolia.appId;
    searchApiKey = manifest.algolia.searchApiKey;
  }

  const params = { appId, searchApiKey, indexName };
  const [records, facets, replicas] = await Promise.all([
    introspectRecords(params),
    introspectFacets(params),
    introspectReplicas(params),
  ]);

  if (!records.ok) {
    return failure({
      command: COMMAND,
      code: records.code,
      message: records.message,
    });
  }

  const warnings: string[] = [];

  let facetList: string[] = [];
  if (facets.ok) {
    facetList = facets.facets;
  } else if (facets.code === 'index_has_no_facets') {
    facetList = [];
  } else {
    warnings.push(facets.message);
  }

  let replicaList: string[] = [];
  if (replicas.ok) {
    replicaList = replicas.replicas;
  } else if (replicas.code === 'no_replicas') {
    replicaList = [];
  } else {
    warnings.push(replicas.message);
  }

  return success({
    command: COMMAND,
    payload: {
      indexName,
      attributes: records.attributes,
      imageCandidates: records.imageCandidates,
      facets: facetList,
      replicas: replicaList,
      warnings,
    },
  });
}
