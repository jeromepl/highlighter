/* eslint-disable no-unused-vars */

// NOTE: This file must be in the top-level directory of the extension according to the docs

import { trackEvent } from './src/background/analytics.js';
import { executeInCurrentTab } from './src/background/utils.js';

// Add option when right-clicking
chrome.runtime.onInstalled.addListener(() => {
    // remove existing menu items
    chrome.contextMenus.removeAll();

    chrome.contextMenus.create({ title: 'Highlight', id: 'highlight', contexts: ['selection'] });
    chrome.contextMenus.create({ title: 'Toggle Cursor', id: 'toggle-cursor' });
    chrome.contextMenus.create({ title: 'Highlighter color', id: 'highlight-colors' });
    chrome.contextMenus.create({ title: 'Yellow', id: 'yellow', parentId: 'highlight-colors', type: 'radio' });
    chrome.contextMenus.create({ title: 'Cyan', id: 'cyan', parentId: 'highlight-colors', type: 'radio' });
    chrome.contextMenus.create({ title: 'Lime', id: 'lime', parentId: 'highlight-colors', type: 'radio' });
    chrome.contextMenus.create({ title: 'Magenta', id: 'magenta', parentId: 'highlight-colors', type: 'radio' });

    // Get the initial selected color value
    chrome.storage.sync.get('color', (values) => {
        const color = values.color || 'yellow';
        chrome.contextMenus.update(color, { checked: true });
    });
});

chrome.contextMenus.onClicked.addListener(({ menuItemId, parentMenuItemId }) => {
    if (parentMenuItemId === 'highlight-color') {
        return changeColorFromContext(menuItemId);
    }

    switch (menuItemId) {
        case 'highlight':
            highlightTextFromContext();
            break;
        case 'toggle-cursor':
            toggleHighlighterCursorFromContext();
            break;
    }
});

// Analytics (non-interactive events)
chrome.runtime.onInstalled.addListener(() => {
    trackEvent('extension', 'installed', chrome.runtime.getManifest().version, null, { ni: 1 });
});
chrome.runtime.onStartup.addListener(() => {
    trackEvent('extension', 'startup', null, null, { ni: 1 });
});

// Add Keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    switch (command) {
        case 'execute-highlight':
            trackEvent('highlight-source', 'keyboard-shortcut');
            highlightText();
            break;
        case 'toggle-highlighter-cursor':
            trackEvent('toggle-cursor-source', 'keyboard-shortcut');
            toggleHighlighterCursor();
            break;
        case 'change-color-to-yellow':
            trackEvent('color-change-source', 'keyboard-shortcut');
            changeColor('yellow');
            break;
        case 'change-color-to-cyan':
            trackEvent('color-change-source', 'keyboard-shortcut');
            changeColor('cyan');
            break;
        case 'change-color-to-lime':
            trackEvent('color-change-source', 'keyboard-shortcut');
            changeColor('lime');
            break;
        case 'change-color-to-magenta':
            trackEvent('color-change-source', 'keyboard-shortcut');
            changeColor('magenta');
            break;
    }
});

// Listen to messages from content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (!request.action) return;

    switch (request.action) {
        case 'highlight':
            trackEvent('highlight-source', 'highlighter-cursor');
            return highlightText();
        case 'track-event':
            return trackEvent(request.trackCategory, request.trackAction);
        case 'remove-highlights':
            return removeHighlights();
        case 'change-color':
            trackEvent('color-change-source', request.source);
            return changeColor(request.color);
        case 'toggle-highlighter-cursor':
            trackEvent('toggle-cursor-source', request.source);
            return toggleHighlighterCursor();
        case 'get-highlights':
            getHighlights().then(sendResponse);
            return true; // return asynchronously
        case 'show-highlight':
            return showHighlight(request.highlightId);
    }
});

function highlightTextFromContext() {
    trackEvent('highlight-source', 'context-menu');
    highlightText();
}

function toggleHighlighterCursorFromContext() {
    trackEvent('toggle-cursor-source', 'context-menu');
    toggleHighlighterCursor();
}

function changeColorFromContext(menuItemId) {
    trackEvent('color-change-source', 'context-menu');
    changeColor(menuItemId);
}

function highlightText() {
    trackEvent('highlight-action', 'highlight');
    executeInCurrentTab({ file: 'src/contentScripts/highlight.js' });
}

function toggleHighlighterCursor() {
    trackEvent('highlight-action', 'toggle-cursor');
    executeInCurrentTab({ file: 'src/contentScripts/toggleHighlighterCursor.js' });
}

function removeHighlights() {
    trackEvent('highlight-action', 'clear-all');
    executeInCurrentTab({ file: 'src/contentScripts/removeHighlights.js' });
}

function showHighlight(highlightId) {
    trackEvent('highlight-action', 'show-highlight');

    function contentScriptShowHighlight(highlightId) {
        const highlightEl = document.querySelector(`[data-highlight-id="${highlightId}"]`);
        if (highlightEl) {
            highlightEl.scrollIntoViewIfNeeded(true);
            const boundingRect = highlightEl.getBoundingClientRect();
            onHighlightMouseEnterOrClick({
                'type': 'click',
                'target': highlightEl,
                'clientX': boundingRect.left + (boundingRect.width / 2),
            });
        }
    }

    executeInCurrentTab({ func: contentScriptShowHighlight, args: [highlightId] });
}

function getHighlights() {
    return executeInCurrentTab({ file: 'src/contentScripts/getHighlights.js' });
}

function changeColor(color) {
    trackEvent('color-changed-to', color);
    chrome.storage.sync.set({ color: color });

    // Also update the context menu
    chrome.contextMenus.update(color, { checked: true });
}
