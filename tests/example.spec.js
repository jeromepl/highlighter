import { test, expect } from './fixtures';
import { selectText } from './utils';

import path from 'path';

test.describe('popup', () => {
  test('popup page', async ({ popupPage }) => {
    await expect(popupPage.locator('body')).toContainText('Highlighter');
  });
});

test.describe('highlight', () => {
  test.beforeEach(async ({ page }) => {
    page.goto(path.join(__dirname, 'assets/test-page.html'))
    await page.bringToFront();
  });

  test('highlights selected text', async ({ popupPage, page }) => {
    await selectText(page, 'Test Page for Highlighter');

    // TODO: Utility to make sure that every time we send something from the popup page, the main page is the active (front) one.
    await page.bringToFront();
    await popupPage.evaluate(() => {
      chrome.runtime.sendMessage({ action: 'highlight' });
    });

    await expect(page.locator('highlighter-span')).toHaveText('Test Page for Highlighter');
  });
});
