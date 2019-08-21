declare namespace WebdriverIOAsync {
  interface Browser {
    getSelectedHierarchicalMenuItems(): Promise<string[]>;
  }
}

browser.addCommand('getSelectedHierarchicalMenuItems', async () => {
  const items = await browser.$$(
    '.ais-HierarchicalMenu-item--selected .ais-HierarchicalMenu-label'
  );
  return await browser.getTextFromElements(items);
});
