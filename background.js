// Add option when right-clicking
chrome.contextMenus.create({"title": "Highlight", "onclick": highlightText, "contexts": ["selection"]});

function highlightText() {
    chrome.tabs.executeScript({file: "jquery-2.1.3.min.js"}, function() {
        chrome.tabs.executeScript({file: "contentScripts/highlight.js"});
    });
}

function removeHighlights() {
    chrome.tabs.executeScript({file: "jquery-2.1.3.min.js"}, function() {
        chrome.tabs.executeScript({file: "contentScripts/removeHighlights.js"});
    });
}
