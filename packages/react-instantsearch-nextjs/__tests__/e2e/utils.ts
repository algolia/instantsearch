export async function waitForUrl(url: string, timeout = 15000) {
  return await browser.waitUntil(
    async () => {
      try {
        const currentUrl = await browser.getUrl();
        return currentUrl === url;
      } catch (error) {
        // Retry on network errors
        console.log(`Error getting URL: ${error.message}`);
        return false;
      }
    },
    {
      timeout,
      timeoutMsg: `Expected URL to be "${url}" but got "${await browser.getUrl()}" after ${timeout}ms`,
      interval: 500,
    }
  );
}

export async function waitForElementText(selector: string, expectedText: string, timeout = 15000) {
  return await browser.waitUntil(
    async () => {
      try {
        const element = await $(selector);
        const text = await element.getText();
        return text === expectedText;
      } catch (error) {
        console.log(`Error getting text from ${selector}: ${error.message}`);
        return false;
      }
    },
    {
      timeout,
      timeoutMsg: `Expected element "${selector}" to have text "${expectedText}" after ${timeout}ms`,
      interval: 500,
    }
  );
}

export async function waitForInputValue(selector: string, expectedValue: string, timeout = 15000) {
  return await browser.waitUntil(
    async () => {
      try {
        const element = await $(selector);
        const value = await element.getValue();
        return value === expectedValue;
      } catch (error) {
        console.log(`Error getting value from ${selector}: ${error.message}`);
        return false;
      }
    },
    {
      timeout,
      timeoutMsg: `Expected input "${selector}" to have value "${expectedValue}" after ${timeout}ms`,
      interval: 500,
    }
  );
}
