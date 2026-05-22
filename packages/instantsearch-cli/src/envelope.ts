type SuccessEnvelope = {
  ok: true;
  command: string;
  filesCreated: string[];
  nextSteps: string[];
  data?: Record<string, unknown>;
};

type FailureEnvelope = {
  ok: false;
  command: string;
  code: string;
  message: string;
};

type Envelope = SuccessEnvelope | FailureEnvelope;

export function successEnvelope(
  command: string,
  details: {
    filesCreated?: string[];
    nextSteps?: string[];
    data?: Record<string, unknown>;
  } = {}
): SuccessEnvelope {
  return {
    ok: true,
    command,
    filesCreated: details.filesCreated ?? [],
    nextSteps: details.nextSteps ?? [],
    ...(details.data !== undefined && { data: details.data }),
  };
}

export function failureEnvelope(
  command: string,
  code: string,
  message: string
): FailureEnvelope {
  return { ok: false, command, code, message };
}

export function formatEnvelope(envelope: Envelope): string {
  return `${JSON.stringify(envelope)}\n`;
}
