import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function highlightText() {
    trackEvent('highlight-action', 'highlight');
    executeInCurrentTab({ file: 'src/contentScripts/highlight.js' });
}

export default highlightText;
