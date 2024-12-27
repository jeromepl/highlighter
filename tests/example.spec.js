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
    page.goto(path.join(__dirname, 'assets/test-page.html'));
    await page.bringToFront();
  });

  test.describe('highlight', () => {
    test('highlights selected text', async ({ popupPage, page }) => {
      highlightText(page, popupPage, 'Test Page for Highlighter');

      await expect(page.locator('highlighter-span')).toHaveText('Test Page for Highlighter');
    });

    // TODO: Add more tests for edge cases, like other types of nodes and nested nodes.
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
