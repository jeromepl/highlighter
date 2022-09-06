import getCurrentColor from './getCurrentColor.js';

import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

async function highlightText() {
    trackEvent('highlight-action', 'highlight');

    function contentScriptHighlightText(currentColor) {
        window.highlighterAPI.highlight.create(currentColor);
    }

    const currentColor = await getCurrentColor();
    executeInCurrentTab({ func: contentScriptHighlightText, args: [currentColor] });
}

export default highlightText;
