"use strict";

window.showHighlighterCursor = !window.showHighlighterCursor; // toggle

if (window.showHighlighterCursor) { // Show the cursor now
    document.body.style.cursor = `url(${chrome.extension.getURL('images/cursor.png')}), auto`;

    // Highlight right away if some text is already selected
    highlightOnSelection();
} else {
    document.body.style.cursor = 'default';
}
