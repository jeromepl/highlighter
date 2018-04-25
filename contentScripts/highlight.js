"use strict";

var selection = window.getSelection();
var selectionString = selection.toString();

if (selectionString) { // If there is text selected

    var container = selection.getRangeAt(0).commonAncestorContainer;

    // Sometimes the element will only be text. Get the parent in that case
    // TODO: Is this really necessary?
    while (!container.innerHTML) {
        container = container.parentNode;
    }

    chrome.storage.sync.get('color', (values) => {
        var color = values.color;
        store(selection, container, window.location.pathname, color, () => {
            highlight(selectionString, container, selection, color);
        });
    });
}
