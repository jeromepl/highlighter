import { test, expect } from './fixtures';
import { highlightText, selectText } from './utils';

import path from 'path';

// NOTE: It's not possible to simulate opening the context menu and triggering
// extension actions using Playwright. So instead, here we simulate the
// context menu action by sending the equivalent message to the background
// worker directly.

// test.describe('context menu actions', () => {
//   test.beforeEach(async ({ page }) => {
//     await page.goto(`file://${path.join(__dirname, 'assets/test-page.html')}`);
//     await page.bringToFront();
//   });

//   test.describe('highlight', () => {
//     test('highlights selected text', async ({ popupPage, page }) => {
//       await highlightText(page, popupPage, 'Test Page for Highlighter');

//       await expect(page.locator('highlighter-span')).toHaveText('Test Page for Highlighter');
//     });

//     test('highlights text in nested elements', async ({ popupPage, page }) => {
//       await highlightText(page, popupPage, 'Nested span text');

//       await expect(page.locator('highlighter-span')).toHaveText('Nested span text');
//     });

//     test('highlights text with different anchor and focus elements', async ({ popupPage, page }) => {
//       // No easy way to select from different DOM nodes at once, so do it piece-wise:
//       await selectText(page, 'Nested span text');
//       await selectText(page, ' for highlighting.');
//       // Once everything is selected, highlight it:
//       await page.bringToFront();
//       await popupPage.evaluate(async () => {
//         await chrome.runtime.sendMessage({ action: 'highlight' });
//       });

//       await expect(page.locator('highlighter-span[data-highlight-id="0"]')).toHaveCount(2);
//       const highlightedText = (await page.locator('highlighter-span').allInnerTexts()).join('');
//       expect(highlightedText).toBe('Nested span text for highlighting.');
//     });

//     test('highlights text in table cells', async ({ popupPage, page }) => {
//       await highlightText(page, popupPage, 'Cell 2: Another');

//       await expect(page.locator('highlighter-span')).toHaveText('Cell 2: Another');
//     });
//   });

//   test.describe('change highlight color', () => {
//     test('changes the highlight color', async ({ popupPage, page }) => {
//       await highlightText(page, popupPage, 'Test Page for Highlighter');

//       await expect(page.locator('highlighter-span')).toHaveCSS('background-color', 'rgb(255, 246, 21)');

//       await page.bringToFront();
//       await popupPage.evaluate(() => {
//         chrome.runtime.sendMessage({ action: 'change-color', color: 'blue' });
//       });

//       await highlightText(page, popupPage, 'Paragraph 1');

//       await expect(page.locator('highlighter-span', { hasText: 'Paragraph 1' })).toHaveCSS('background-color', 'rgb(66, 229, 255)');
//     });
//   });

//   test.describe('toggle cursor', () => {
//     test('toggles the highlighter cursor', async ({ popupPage, page, extensionId }) => {
//       await page.bringToFront();
//       await popupPage.evaluate(() => {
//         chrome.runtime.sendMessage({ action: 'toggle-highlighter-cursor' });
//       });

//       await expect(page.locator('body')).toHaveCSS('cursor', `url("chrome-extension://${extensionId}/images/cursor.png"), auto`);

//       await selectText(page, 'Test Page for Highlighter'); // Now simply selecting the text should highlight it

//       await expect(page.locator('highlighter-span')).toHaveText('Test Page for Highlighter');
//     });
//   });
// });
