export type TaskPrepareRequest = (body: Record<string, unknown>) => {
  body: Record<string, unknown>;
};

export type BuildTaskPayloadOptions = {
  /**
   * The server-owned task ID to invoke. The task's instructions, input schema,
   * and output schema live in the agent config, not here.
   */
  task: string;
  /**
   * Free-form task input forwarded as-is under the request's `input` key. The
   * server owns the shape beyond whatever the task requires.
   */
  input: Record<string, unknown>;
  /**
   * Last-chance hook to mutate the outgoing body (e.g. inject fields required
   * by a custom transport).
   */
  prepareRequest?: TaskPrepareRequest;
};

/**
 * Builds the flat `{ task, input }` request body accepted by the Agent Studio
 * `tasks` endpoint. Endpoint- and payload-agnostic beyond the envelope — the
 * caller owns the `input` contents and the server owns the output shape.
 */
export function buildTaskPayload({
  task,
  input,
  prepareRequest,
}: BuildTaskPayloadOptions): Record<string, unknown> {
  const payload: Record<string, unknown> = { task, input };

  return prepareRequest ? prepareRequest(payload).body : payload;
}
