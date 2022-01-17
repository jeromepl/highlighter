"use strict";

const MAX_RETRY_TIME = 10000; // Stop trying to highlight after this time (in ms)
const RETRY_INTERVAL = 500;

// Keep track of highlights that can't be loaded so that we can show
// them in the popup UI
// Use a Map instead of an object to keep order
window.highlighter_lostHighlights ||= new Map(); /* eslint-disable-line camelcase */

function addHighlightError(highlight, highlightIndex) { /* eslint-disable-line no-redeclare, no-unused-vars */
    const highlightError = {
        highlight,
        highlightIndex,
        errorTime: Date.now(),
    };
    highlightError.timeout = setTimeout(retryHighlightError, RETRY_INTERVAL, highlightError);
    window.highlighter_lostHighlights.set(highlightIndex, highlight);
}

function retryHighlightError(highlightError) {
    const success = load(highlightError.highlight, highlightError.highlightIndex, true);

    if (success) {
        window.highlighter_lostHighlights.delete(highlightError.highlightIndex);
        return;
    }

    if (Date.now() - highlightError.errorTime < MAX_RETRY_TIME) {
        highlightError.timeout = setTimeout(retryHighlightError, RETRY_INTERVAL, highlightError);
    }
}
