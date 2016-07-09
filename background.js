
// Create a parent item and two children.
var parent = chrome.contextMenus.create({"title": "Highlight", "onclick": highlightText, "contexts": ["selection"]});

function highlightText(info, tab) {
    chrome.tabs.executeScript({file: "jquery-2.1.3.min.js"}, function() {
        chrome.tabs.executeScript({file: "contentScript.js"};
    });
}
