import { test, expect } from './fixtures';
import { selectText } from './utils';

// test('example test', async ({ page }) => {
//   await page.goto('https://example.com');
//   await expect(page.locator('body')).toHaveText('Changed by my-extension');
// });

test.describe('popup', () => {
  test('popup page', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/src/popup/index.html`);
    await expect(page.locator('body')).toContainText('Highlighter');
  });
});

test.describe('highlight', () => {
  test('test', async ({ context, backgroundWorker, extensionId, page }) => {
    await page.goto('https://example.com');

    await selectText(page, 'You may use this');

    backgroundWorker.on('console', msg => console.log(msg.text()));

    await backgroundWorker.evaluate(async (extensionId) => {
      const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
      await chrome.tabs.sendMessage(activeTab.id, {
        method: 'highlight.create',
        params: [{
          title: 'yellow',
          color: 'rgb(255, 246, 21)',
        }],
      });
    }, extensionId);

    // await page.keyboard.press("Alt+H");

    await page.pause();
  });
});
