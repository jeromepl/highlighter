import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function removeHighlights() {
    trackEvent('highlight-action', 'clear-all');

    function contentScriptRemoveHighlights() {
        window.highlighterAPI.highlights.deleteAll();
    }

    executeInCurrentTab({ func: contentScriptRemoveHighlights });
}

export default removeHighlights;
