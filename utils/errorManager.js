"use strict";

var MAX_RETRY_TIME = 10000; // Stop trying to highlight after this time (in ms)
var RETRY_INTERVAL = 500;

var highlightErrors = [];

function addHighlightError(highlight, highlightIndex) {
    highlightErrors.push({
        highlight,
        highlightIndex,
        errorTime: Date.now()
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