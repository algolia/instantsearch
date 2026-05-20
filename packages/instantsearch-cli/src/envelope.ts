const API_VERSION = 1;

type SuccessEnvelope = {
  ok: true;
  command: string;
  apiVersion: typeof API_VERSION;
  filesCreated: string[];
  nextSteps: string[];
};

type FailureEnvelope = {
  ok: false;
  command: string;
  apiVersion: typeof API_VERSION;
  code: string;
  message: string;
};

type Envelope = SuccessEnvelope | FailureEnvelope;

export function successEnvelope(
  command: string,
  details: { filesCreated?: string[]; nextSteps?: string[] } = {}
): SuccessEnvelope {
  return {
    ok: true,
    command,
    apiVersion: API_VERSION,
    filesCreated: details.filesCreated ?? [],
    nextSteps: details.nextSteps ?? [],
  };
}

export function failureEnvelope(
  command: string,
  code: string,
  message: string
): FailureEnvelope {
  return { ok: false, command, apiVersion: API_VERSION, code, message };
}

export function formatEnvelope(envelope: Envelope): string {
  return `${JSON.stringify(envelope)}\n`;
}
