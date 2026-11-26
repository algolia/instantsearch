type v4 = { transporter?: { userAgent: { value: string } } };
// v5 clients expose their agent through a `_ua` getter.
type v5 = { _ua: string };
type AnySearchClient = v4 & v5;

export function getAlgoliaAgent(client: unknown): string {
  const clientTyped = client as AnySearchClient;
  return clientTyped.transporter && clientTyped.transporter.userAgent
    ? clientTyped.transporter.userAgent.value
    : clientTyped._ua;
}
