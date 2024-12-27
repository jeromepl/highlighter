import { test as base, chromium } from '@playwright/test';

import path from 'path';

// Taken from https://playwright.dev/docs/chrome-extensions

export const test = base.extend({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, "../");
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  backgroundWorker: async ({ context }, use) => {
    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    await use(background);
  },
  extensionId: async ({ context, backgroundWorker }, use) => {
    const extensionId = backgroundWorker.url().split('/')[2];
    await use(extensionId);
  },
  // There are a lot of limitations to testing chrome extensions with playwright.
  // One of those is that we can't open the popup page in the same way a user would.
  // Instead, we have to open the popup in a new tab, and make sure that our code is able to handle that,
  // by launching the content scripts in the correct (active) tab.
  // Note that we also can't (for some reason) send messages to the service worker through the main page,
  // so we have to do it through the popup page. Otherwise chrome.runtime returns null.
  popupPage: async({ context, extensionId }, use) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/src/popup/index.html`);
    await use(page);
  },
});
export const expect = test.expect;
