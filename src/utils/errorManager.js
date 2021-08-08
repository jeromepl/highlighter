"use strict";

const MAX_RETRY_TIME = 10000; // Stop trying to highlight after this time (in ms)
const RETRY_INTERVAL = 500;

const highlightErrors = [];

function addHighlightError(highlight, highlightIndex) { /* eslint-disable-line no-redeclare, no-unused-vars */
    highlightErrors.push({
        highlight,
        highlightIndex,
        errorTime: Date.now(),
    });
}

setInterval(() => {
    highlightErrors.forEach((highlightError, idx) => {
        if (Date.now() - highlightError.errorTime > MAX_RETRY_TIME) { // Stop the search
            highlightErrors.splice(idx, 1);
        } else { // Keep retrying
            const success = load(highlightError.highlight, highlightError.highlightIndex, true);
            if (success) {
                highlightErrors.splice(idx, 1);
            }
        }
    });
}, RETRY_INTERVAL);
