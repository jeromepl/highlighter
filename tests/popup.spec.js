import { test, expect } from './fixtures';
import { highlightText } from './utils';

import path from 'path';

test.describe('popup', () => {
  test('popup page', async ({ popupPage }) => {
    await expect(popupPage.locator('body')).toContainText('Highlighter');
  });
});

test.describe('background worker actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'assets/test-page.html')}`);
    await page.bringToFront();
  });

  test.describe('remove-highlights', () => {
    test('removes all highlights on the page', async ({ popupPage, page }) => {
      await highlightText(page, popupPage, 'Test Page for Highlighter');
      await highlightText(page, popupPage, 'Paragraph 1');

      await expect(page.locator('highlighter-span')).toHaveCount(2);

      await page.bringToFront();
      await popupPage.evaluate(() => {
        chrome.runtime.sendMessage({ action: 'remove-highlights' });
      });

      await expect(page.locator('highlighter-span')).toHaveCount(0);
    });
  });
});
