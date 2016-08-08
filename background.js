"use strict";

// Add option when right-clicking
chrome.contextMenus.create({"title": "Highlight", "onclick": highlightText, "contexts": ["selection"]});

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
