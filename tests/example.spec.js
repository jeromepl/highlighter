import { test, expect } from './fixtures';
import { selectText } from './utils';

test.describe('popup', () => {
  test('popup page', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/src/popup/index.html`);
    await expect(page.locator('body')).toContainText('Highlighter');
  });
});

test.describe('highlight', () => {
  test('highlights selected text', async ({ popupPage, page }) => {
    await page.goto('https://example.com');

    await selectText(page, 'You may use this');

    await popupPage.evaluate(() => {
      chrome.runtime.sendMessage({ action: 'highlight' });
    });

    await expect(page.locator('highlighter-span')).toHaveText("You may use this");
  });
});
