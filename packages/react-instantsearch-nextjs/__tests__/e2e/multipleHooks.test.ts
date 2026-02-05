describe('multiple hooks in a single component', () => {
  it('only renders first hook if skipSuspense not set to true', async () => {
    await browser.url('/multiple-hooks');

    const withoutSkipSuspense = await $('#without-skip-suspense');
    expect((await withoutSkipSuspense.$$('li')).length).toBe(1);
  });

  it('only renders hooks properly if skipSuspense set to true', async () => {
    await browser.url('/multiple-hooks');

    const withoutSkipSuspense = await $('#with-skip-suspense');
    expect((await withoutSkipSuspense.$$('li')).length).toBe(2);
  });
});
