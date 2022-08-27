import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function removeHighlights() {
    trackEvent('highlight-action', 'clear-all');
    executeInCurrentTab({ file: 'src/contentScripts/removeHighlights.js' });
}

export default removeHighlights;
