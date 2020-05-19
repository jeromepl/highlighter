"use strict";

// highlightId needs to be passed in as a global var for this script to work
if (highlightId !== undefined) {
    var highlightEl = document.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (highlightEl) {
        highlightEl.scrollIntoViewIfNeeded(true);
        var boundingRect = highlightEl.getBoundingClientRect();
        onHighlightMouseEnterOrClick({ 'type': 'click', 'target': highlightEl, 'clientX': boundingRect.left + boundingRect.width / 2 });
    }
}
