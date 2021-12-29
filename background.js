/* eslint-disable no-unused-vars */

// NOTE: This file must be in the top-level directory of the extension according to the docs

import { trackEvent } from './src/background/analytics.js';
import { executeInCurrentTab } from './src/background/utils.js';

const DEFAULT_COLOR_TITLE = "yellow";

// Add option when right-clicking
chrome.runtime.onInstalled.addListener(async () => {
    // remove existing menu items
    chrome.contextMenus.removeAll();

    chrome.contextMenus.create({ title: 'Highlight', id: 'highlight', contexts: ['selection'] });
    chrome.contextMenus.create({ title: 'Toggle Cursor', id: 'toggle-cursor' });
    chrome.contextMenus.create({ title: 'Highlighter color', id: 'highlight-colors' });
    chrome.contextMenus.create({ title: 'Yellow', id: 'yellow', parentId: 'highlight-colors', type: 'radio' });
    chrome.contextMenus.create({ title: 'Blue', id: 'blue', parentId: 'highlight-colors', type: 'radio' });
    chrome.contextMenus.create({ title: 'Green', id: 'green', parentId: 'highlight-colors', type: 'radio' });
    chrome.contextMenus.create({ title: 'Pink', id: 'pink', parentId: 'highlight-colors', type: 'radio' });
    chrome.contextMenus.create({ title: "Dark", id: "dark", parentId: "highlight-colors", type: "radio" });

    // Get the initial selected color value
    const { title: colorTitle } = await getCurrentColor();
    chrome.contextMenus.update(colorTitle, { checked: true });
});

chrome.contextMenus.onClicked.addListener(({ menuItemId, parentMenuItemId }) => {
    if (parentMenuItemId === 'highlight-color') {
        changeColorFromContext(menuItemId);
        return;
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
        case 'change-color-to-dark':
            trackEvent('color-change-source', 'keyboard-shortcut');
            changeColor('dark');
            break;
    }
});

// Listen to messages from content scripts
/* eslint-disable consistent-return */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (!request.action) return;

    switch (request.action) {
        case 'highlight':
            trackEvent('highlight-source', 'highlighter-cursor');
            highlightText();
            return;
        case 'track-event':
            trackEvent(request.trackCategory, request.trackAction);
            return;
        case 'remove-highlights':
            removeHighlights();
            return;
        case 'change-color':
            trackEvent('color-change-source', request.source);
            changeColor(request.color);
            return;
        case 'edit-color':
            editColor(request.colorTitle, request.color, request.textColor);
            return;
        case 'toggle-highlighter-cursor':
            trackEvent('toggle-cursor-source', request.source);
            toggleHighlighterCursor();
            return;
        case 'get-highlights':
            getHighlights().then(sendResponse);
            return true; // return asynchronously
        case 'show-highlight':
            return showHighlight(request.highlightId);
        case 'get-current-color':
            getCurrentColor().then(sendResponse);
            return true; // return asynchronously
        case 'get-color-options':
            getColorOptions().then(sendResponse);
            return true; // return asynchronously
    }
});
/* eslint-enable consistent-return */

async function getCurrentColor() {
    const { color } = await chrome.storage.sync.get("color");
    const colorTitle = color || DEFAULT_COLOR_TITLE;
    const colorOptions = await getColorOptions();
    return colorOptions.find((colorOption) => colorOption.title === colorTitle);
}

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

    function contentScriptShowHighlight(highlightId) { // eslint-disable-line no-shadow
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

function changeColor(colorTitle) {
    if (!colorTitle) return;

    trackEvent('color-changed-to', colorTitle);
    chrome.storage.sync.set({ color: colorTitle });

    // Also update the context menu
    chrome.contextMenus.update(colorTitle, { checked: true });
}

async function editColor(colorTitle, color, textColor) {
    trackEvent('color-edit', colorTitle);

    const colorOptions = await getColorOptions();
    const colorOption = colorOptions.find((option) => option.title === colorTitle);
    colorOption.color = color;
    colorOption.textColor = textColor;

    if (!textColor) {
        delete colorOption.textColor;
    }

    chrome.storage.sync.set({ colors: colorOptions });
}

function getColorOptions() {
    return new Promise((resolve, _reject) => {
        chrome.storage.sync.get({
            colors: [ // Default value
                {
                    title: 'yellow',
                    color: 'rgb(255, 246, 21)',
                },
                {
                    title: 'green',
                    color: 'rgb(68, 255, 147)',
                },
                {
                    title: 'blue',
                    color: 'rgb(66, 229, 255)',
                },
                {
                    title: 'pink',
                    color: 'rgb(244, 151, 255)',
                },
                {
                    title: 'dark',
                    color: 'rgb(52, 73, 94)',
                    textColor: 'rgb(255, 255, 255)',
                },
            ],
        }, ({ colors }) => resolve(colors));
    });
}
