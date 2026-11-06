export function isValidAgentBody(body: unknown): boolean;
export function playTurn(
  body: unknown,
  sink: { write: (frame: string) => void; end: () => void }
): () => void;
