import { test, expect } from './fixtures';

// test('example test', async ({ page }) => {
//   await page.goto('https://example.com');
//   await expect(page.locator('body')).toHaveText('Changed by my-extension');
// });

test('popup page', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/src/popup/index.html`);
  await expect(page.locator('body')).toContainText('Highlighter');
});
