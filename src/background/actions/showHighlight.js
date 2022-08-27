import { trackEvent } from '../analytics.js';
import { executeInCurrentTab } from '../utils.js';

function showHighlight(highlightId) {
    trackEvent('highlight-action', 'show-highlight');

    function contentScriptShowHighlight(highlightId) { // eslint-disable-line no-shadow
        const highlightEl = document.querySelector(`[data-highlight-id="${highlightId}"]`);
        if (highlightEl) {
            highlightEl.scrollIntoViewIfNeeded(true);
            const boundingRect = highlightEl.getBoundingClientRect();
            onHighlightMouseEnterOrClick({
                'type': 'click',
                'target': highlightEl,
                'clientX': boundingRect.left + (boundingRect.width / 2),
            });
        }
    }

    executeInCurrentTab({ func: contentScriptShowHighlight, args: [highlightId] });
}

export default showHighlight;
