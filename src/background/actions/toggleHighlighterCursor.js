import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function toggleHighlighterCursor() {
    trackEvent('highlight-action', 'toggle-cursor');

    function contentScriptToggleHighlighterCursor() {
        window.highlighterAPI.highlighterCursor.toggle();
    }

    executeInCurrentTab({ func: contentScriptToggleHighlighterCursor });
}

export default toggleHighlighterCursor;
