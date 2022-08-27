import { load } from './storageManager.js';

const MAX_RETRY_TIME = 10000; // Stop trying to highlight after this time (in ms)
const RETRY_INTERVAL = 500;

// Keep track of highlights that can't be loaded so that we can show
// them in the popup UI
// Use a Map instead of an object to keep order
const lostHighlights = new Map();

function addHighlightError(highlight, highlightIndex) {
    const highlightError = {
        highlight,
        highlightIndex,
        errorTime: Date.now(),
    };
    highlightError.timeout = setTimeout(retryHighlightError, RETRY_INTERVAL, highlightError);
    lostHighlights.set(highlightIndex, highlight);
}

function retryHighlightError(highlightError) {
    const success = load(highlightError.highlight, highlightError.highlightIndex, true);

    if (success) {
        lostHighlights.delete(highlightError.highlightIndex);
        return;
    }

    if (Date.now() - highlightError.errorTime < MAX_RETRY_TIME) {
        highlightError.timeout = setTimeout(retryHighlightError, RETRY_INTERVAL, highlightError);
    }
}

function getLostHighlights() {
    return lostHighlights;
}

function removeLostHighlight(highlightIndex) {
    const highlightError = lostHighlights.get(highlightIndex);
    clearTimeout(highlightError?.timeout);
    lostHighlights.delete(highlightIndex);
}

export { addHighlightError, getLostHighlights, removeLostHighlight };
