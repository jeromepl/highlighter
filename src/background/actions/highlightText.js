import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function highlightText() {
    trackEvent('highlight-action', 'highlight');

    function contentScriptHighlightText() {
        window.highlighterAPI.highlightSelectedText();
    }

    executeInCurrentTab({ func: contentScriptHighlightText });
}

export default highlightText;
