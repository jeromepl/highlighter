import { trackEvent } from '../analytics.js';

function changeColor(colorTitle) {
    if (!colorTitle) return;

    trackEvent('color-changed-to', colorTitle);
    chrome.storage.sync.set({ color: colorTitle });

    // Also update the context menu
    chrome.contextMenus.update(colorTitle, { checked: true });
}

export default changeColor;
