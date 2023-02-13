export async function waitForUrl(url: string) {
  return await browser.waitUntil(async () => (await browser.getUrl()) === url);
}
