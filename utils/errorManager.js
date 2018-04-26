var MAX_RETRY_TIME = 10000; // Stop trying to highlight after this time (in ms)
var RETRY_INTERVAL = 500;

var highlightErrors = [];

function addHighlightError(highlight) {
    highlightErrors.push({
        highlight: highlight,
        errorTime: Date.now()
    });
}

setInterval(() => {
    highlightErrors.forEach((highlightError, idx) => {
        if (Date.now() - highlightError.errorTime > MAX_RETRY_TIME) { // Stop the search
            highlightErrors.splice(idx, 1);
        } else { // Keep retrying
            var success = load(highlightError.highlight, true);
            if (success) {
                highlightErrors.splice(idx, 1);
            }
        }
    });
}, RETRY_INTERVAL);