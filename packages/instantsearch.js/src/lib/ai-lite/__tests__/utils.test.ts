import { normalizeStreamChunkErrorText } from '../utils';

describe('normalizeStreamChunkErrorText', () => {
  test('returns nested LangGraph-style error string', () => {
    const raw = JSON.stringify({
      error:
        'Recursion limit of 5 reached. Set `recursion_limit` in config. GRAPH_RECURSION_LIMIT',
    });
    expect(normalizeStreamChunkErrorText(raw)).toContain('Recursion limit of 5');
  });

  test('passes through plain text', () => {
    expect(normalizeStreamChunkErrorText('simple failure')).toBe('simple failure');
  });

  test('unwraps nested message field (same order as UI flatten)', () => {
    const raw = JSON.stringify({
      message: 'Response is incomplete due to: max_output_tokens',
    });
    expect(normalizeStreamChunkErrorText(raw)).toBe(
      'Response is incomplete due to: max_output_tokens'
    );
  });

  test('unwraps double-encoded errorText like SSE error chunks', () => {
    const inner = { error: 'Response is incomplete due to: max_output_tokens' };
    const errorText = JSON.stringify(JSON.stringify(inner));
    expect(normalizeStreamChunkErrorText(errorText)).toBe(
      'Response is incomplete due to: max_output_tokens'
    );
  });

  test('full data-line shape: type error + escaped errorText string', () => {
    const inner = { error: 'Response is incomplete due to: max_output_tokens' };
    const innerJson = JSON.stringify(inner);
    const errorText = `"${innerJson.replace(/"/g, '\\"')}"`;
    const line = JSON.stringify({ type: 'error', errorText });
    const chunk = JSON.parse(line);
    expect(normalizeStreamChunkErrorText(chunk.errorText)).toBe(
      'Response is incomplete due to: max_output_tokens'
    );
  });
});
