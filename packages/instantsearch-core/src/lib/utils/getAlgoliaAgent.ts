type v4 = { transporter?: { userAgent: { value: string } } };
type v3 = { _ua: string };
type AnySearchClient = v4 & v3;

export function getAlgoliaAgent(client: unknown): string {
  const clientTyped = client as AnySearchClient;
  return clientTyped.transporter && clientTyped.transporter.userAgent
    ? clientTyped.transporter.userAgent.value
    : clientTyped._ua;
}
