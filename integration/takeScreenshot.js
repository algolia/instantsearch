const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');

const takeScreenshot = async ({ screenshotsPath, story, page }) => {
  const { kind, name, url } = story;

  const folderPath = join(screenshotsPath, kind);
  const filePath = join(folderPath, `${name}-medium.png`);

  if (!existsSync(folderPath)) {
    mkdirSync(folderPath);
  }

  await page.goto(url, {
    waitUntil: 'networkidle2',
  });

  await page.screenshot({
    path: filePath,
    fullPage: true,
  });
};

module.exports = takeScreenshot;
