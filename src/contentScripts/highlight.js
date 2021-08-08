"use strict";

(() => { // Restrict the scope of the variables to this file
    const selection = window.getSelection();
    const selectionString = selection.toString();

    if (selectionString) { // If there is text selected

        let container = selection.getRangeAt(0).commonAncestorContainer;

        // Sometimes the element will only be text. Get the parent in that case
        // TODO: Is this really necessary?
        while (!container.innerHTML) {
            container = container.parentNode;
        }

        chrome.storage.sync.get('color', (values) => {
            const color = values.color;
            store(selection, container, window.location.hostname + window.location.pathname, color, (highlightIndex) => {
                highlight(selectionString, container, selection, color, highlightIndex);
            });
        });
    }
})();
