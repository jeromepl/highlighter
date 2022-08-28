import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function showHighlight(highlightId) {
    trackEvent('highlight-action', 'show-highlight');

    function contentScriptShowHighlight(highlightId) { // eslint-disable-line no-shadow
        window.highlighterAPI.highlight.show(highlightId);
    }

    executeInCurrentTab({ func: contentScriptShowHighlight, args: [highlightId] });
}

export default showHighlight;
