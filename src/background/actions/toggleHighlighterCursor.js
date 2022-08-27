import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function toggleHighlighterCursor() {
    trackEvent('highlight-action', 'toggle-cursor');
    executeInCurrentTab({ file: 'src/contentScripts/toggleHighlighterCursor.js' });
}

export default toggleHighlighterCursor;
