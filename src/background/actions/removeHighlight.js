import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function removeHighlight(highlightId, lost = false) {
    trackEvent('highlight-action', 'remove-highlight');

    function contentScriptRemoveHighlight(highlightIndex, isLost) {
        if (isLost) {
            window.highlighterAPI.highlight.removeLost(highlightIndex);
        } else {
            window.highlighterAPI.highlight.remove(highlightIndex);
        }
    }

    return executeInCurrentTab({ func: contentScriptRemoveHighlight, args: [highlightId, lost] });
}

export default removeHighlight;
