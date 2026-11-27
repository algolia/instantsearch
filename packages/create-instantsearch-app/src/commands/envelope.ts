type SuccessEnvelope = {
  ok: true;
  command: string;
  filesCreated: string[];
  nextSteps: string[];
  filesModified?: string[];
  data?: Record<string, unknown>;
};

type FailureEnvelope = {
  ok: false;
  command: string;
  code: string;
  message: string;
  nextSteps?: string[];
};

type Envelope = SuccessEnvelope | FailureEnvelope;

export function successEnvelope(
  command: string,
  details: {
    filesCreated?: string[];
    filesModified?: string[];
    nextSteps?: string[];
    data?: Record<string, unknown>;
  } = {}
): SuccessEnvelope {
  return {
    ok: true,
    command,
    filesCreated: details.filesCreated ?? [],
    nextSteps: details.nextSteps ?? [],
    ...(details.filesModified && details.filesModified.length > 0
      ? { filesModified: details.filesModified }
      : {}),
    ...(details.data ? { data: details.data } : {}),
  };
}

export function failureEnvelope(
  command: string,
  code: string,
  message: string,
  nextSteps?: string[]
): FailureEnvelope {
  return {
    ok: false,
    command,
    code,
    message,
    ...(nextSteps && nextSteps.length > 0 ? { nextSteps } : {}),
  };
}

export function formatEnvelope(envelope: Envelope): string {
  return `${JSON.stringify(envelope)}\n`;
}
