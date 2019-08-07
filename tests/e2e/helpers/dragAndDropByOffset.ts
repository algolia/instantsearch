declare namespace WebdriverIOAsync {
  interface Browser {
    dragAndDropByOffset(
      source: WebdriverIOAsync.Element,
      x: number,
      y?: number
    ): Promise<void>;
  }
}

browser.addCommand(
  'dragAndDropByOffset',
  async (
    source: WebdriverIOAsync.Element,
    offsetX: number,
    offsetY: number = 0
  ) => {
    // Assures us that the source element is in the viewport
    // (`dragAndDrop` fails if its not the case)
    await source.scrollIntoView();

    const sourceLocation = await source.getLocation();

    // WebdriverIO `dragAndDrop` method only works with an existing element as target,
    // so we create a dummy element in the document to use as a target
    const targetId = await browser.execute(
      (browserSourceX, browserSourceY, browserOffsetX, browserOffsetY) => {
        const target = document.createElement('div');
        target.id = `tmp-${Math.floor(Math.random() * 1e9)}`;
        target.style.position = 'absolute';
        target.style.left = `${browserSourceX + browserOffsetX}px`;
        target.style.top = `${browserSourceY + browserOffsetY}px`;
        document.body.appendChild(target);
        return target.id;
      },
      sourceLocation.x,
      sourceLocation.y,
      offsetX,
      offsetY
    );
    const target = await browser.$(`#${targetId}`);

    // @ts-ignore: Ignore bad `dragAndDrop` method definition
    await source.dragAndDrop(target);

    // Cleaning
    await browser.execute(
      browserTarget => document.body.removeChild(browserTarget),
      target
    );
  }
);
