"use strict";

const MAX_RETRY_TIME = 10000; // Stop trying to highlight after this time (in ms)
const RETRY_INTERVAL = 500;

function addHighlightError(highlight, highlightIndex) { /* eslint-disable-line no-redeclare, no-unused-vars */
    const highlightError = {
        highlight,
        highlightIndex,
        errorTime: Date.now(),
    };
    setTimeout(retryHighlightError, RETRY_INTERVAL, highlightError);
}

function retryHighlightError(highlightError) {
    const success = load(highlightError.highlight, highlightError.highlightIndex, true);
    if (!success && Date.now() - highlightError.errorTime < MAX_RETRY_TIME) {
        setTimeout(retryHighlightError, RETRY_INTERVAL, highlightError);
    }
}
