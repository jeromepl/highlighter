import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function removeHighlights() {
    trackEvent('highlight-action', 'clear-all');

    function contentScriptRemoveHighlights() {
        // Remove Highlights
        window.clearPage(window.location.hostname + window.location.pathname, window.location.pathname);
        // Force a reload here in order to get the DOM elements back in their original form
        // This is important since this whole thing depends on having reliable query strings
        window.location.reload();
    }

    executeInCurrentTab({ func: contentScriptRemoveHighlights });
}

export default removeHighlights;
