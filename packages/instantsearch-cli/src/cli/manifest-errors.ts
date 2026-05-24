import type { ManifestReadResult } from '../manifest';
import { failure, type FailureReport } from '../reporter';

type ManifestReadFailure = Extract<
  ManifestReadResult<unknown>,
  { ok: false }
>;

export function manifestReadFailure(params: {
  command: string;
  result: ManifestReadFailure;
  notFoundMessage: string;
}): FailureReport {
  const { command, result, notFoundMessage } = params;
  return failure({
    command,
    code: result.code === 'not_found' ? 'not_initialized' : 'invalid_manifest',
    message: result.code === 'not_found' ? notFoundMessage : result.message,
  });
}
