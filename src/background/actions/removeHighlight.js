import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

// TODO: Rename to removeLostHighlight
function removeHighlight(highlightId) {
    trackEvent('highlight-action', 'remove-highlight');

    function contentScriptRemoveHighlight(highlightIndex) {
        window.highlighterAPI.highlight.removeLost(highlightIndex);
    }

    executeInCurrentTab({ func: contentScriptRemoveHighlight, args: [highlightId] });
}

export default removeHighlight;
