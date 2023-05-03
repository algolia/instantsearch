declare namespace WebdriverIOAsync {
  interface Browser {
    getSelectedHierarchicalMenuItems: () => Promise<string[]>;
  }
}

browser.addCommand('getSelectedHierarchicalMenuItems', async () => {
  await browser.waitForElement(
    '.ais-HierarchicalMenu-item--selected .ais-HierarchicalMenu-label'
  );

  return await browser.getTextFromSelector(
    '.ais-HierarchicalMenu-item--selected .ais-HierarchicalMenu-label'
  );
});
