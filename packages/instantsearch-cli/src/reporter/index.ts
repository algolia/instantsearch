export const API_VERSION = 1;

export type SuccessReport<Payload extends Record<string, unknown> = Record<string, unknown>> = {
  apiVersion: typeof API_VERSION;
  ok: true;
  command: string;
} & Payload;

export type FailureReport = {
  apiVersion: typeof API_VERSION;
  ok: false;
  command: string;
  code: string;
  message: string;
};

export type Report = SuccessReport | FailureReport;

export function success<Payload extends Record<string, unknown>>({
  command,
  payload = {} as Payload,
}: {
  command: string;
  payload?: Payload;
}): SuccessReport<Payload> {
  return {
    apiVersion: API_VERSION,
    ok: true,
    command,
    ...payload,
  };
}

export function failure({
  command,
  code,
  message,
}: {
  command: string;
  code: string;
  message: string;
}): FailureReport {
  return {
    apiVersion: API_VERSION,
    ok: false,
    command,
    code,
    message,
  };
}
