import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function removeHighlight(highlightId) {
    trackEvent('highlight-action', 'remove-highlight');

    function contentScriptRemoveHighlight(highlightIndex) {
        window.highlighterAPI.removeLostHighlight(highlightIndex);
        window.highlighterAPI.removeHighlight(highlightIndex, window.location.hostname + window.location.pathname, window.location.pathname);
    }

    executeInCurrentTab({ func: contentScriptRemoveHighlight, args: [highlightId] });
}

export default removeHighlight;
