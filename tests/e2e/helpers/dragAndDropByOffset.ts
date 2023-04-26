declare namespace WebdriverIOAsync {
  interface Browser {
    dragAndDropByOffset: (
      source: WebdriverIOAsync.Element,
      x: number,
      y?: number
    ) => Promise<void>;
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
    /* eslint-disable prefer-template */
    const targetId = await browser.execute(
      function (
        browserSourceX,
        browserSourceY,
        browserOffsetX,
        browserOffsetY
      ) {
        const target = document.createElement('div');
        target.id = 'tmp-' + Math.floor(Math.random() * 1e9);
        target.style.position = 'absolute';
        target.style.left = browserSourceX + browserOffsetX + 'px';
        target.style.top = browserSourceY + browserOffsetY + 'px';
        document.body.appendChild(target);
        return target.id;
      },
      Math.round(sourceLocation.x),
      Math.round(sourceLocation.y),
      Math.round(offsetX),
      Math.round(offsetY)
    );
    /* eslint-enable prefer-template */
    const target = await browser.$(`#${targetId}`);

    // @ts-ignore: Ignore bad `dragAndDrop` method definition
    await source.dragAndDrop(target);

    // Cleaning
    await browser.execute(function (browserTargetId) {
      const el = document.getElementById(browserTargetId);
      if (el) {
        document.body.removeChild(el);
      }
    }, targetId);
  }
);
