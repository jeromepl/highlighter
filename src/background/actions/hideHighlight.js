// import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function hideHighlight(highlightId) {
    // trackEvent('highlight-action', 'hide-highlight');

    function contentScriptHideHighlight(highlightId) {
        window.highlighterAPI.highlight.hide(highlightId);
    }

    executeInCurrentTab({ func: contentScriptHideHighlight, args: [highlightId] });
}

export default hideHighlight;
