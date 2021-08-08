"use strict";

window.showHighlighterCursor = false;

// We want this to be exported, so do not wrap this code in a function
function highlightOnSelection() { /* eslint-disable-line no-redeclare */
    if (!window.showHighlighterCursor) return;

    const selection = window.getSelection();
    const selectionString = selection.toString();

    if (selectionString) { // If there is text selected
        chrome.runtime.sendMessage({ action: 'highlight' });
    }
}

document.addEventListener('mouseup', highlightOnSelection);
