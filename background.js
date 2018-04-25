"use strict";

// Add option when right-clicking
chrome.contextMenus.create({ title: "Highlight", onclick: highlightText, contexts: ["selection"] });
chrome.contextMenus.create({ title: "Highlighter color", id: "highlight-colors" });
chrome.contextMenus.create({ title: "Yellow", id: "yellow", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });
chrome.contextMenus.create({ title: "Cyan", id: "cyan", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });
chrome.contextMenus.create({ title: "Lime", id: "lime", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });
chrome.contextMenus.create({ title: "Magenta", id: "magenta", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });

// Get the initial color value
chrome.storage.sync.get('color', (values) => {
    var color = values.color ? values.color : "yellow";
    chrome.contextMenus.update(color, { checked: true });
});

// Add Keyboard shortcut
chrome.commands.onCommand.addListener(function(command) {
    if (command === "execute-highlight")
        highlightText();
});

function highlightText() {
    chrome.tabs.executeScript({file: 'contentScripts/highlight.js'});
}

function removeHighlights() {
    chrome.tabs.executeScript({file: 'contentScripts/removeHighlights.js'});
}

function changeColorFromContext(info) {
    changeColor(info.menuItemId);
}

function changeColor(color) {
    chrome.storage.sync.set({ color: color });

    // Also update the context menu
    chrome.contextMenus.update(color, { checked: true });
}
