import { onHighlightMouseEnterOrClick } from '../hoverTools/index.js';

function show(highlightId) {
    const highlightEl = document.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (highlightEl) {
        highlightEl.scrollIntoViewIfNeeded(true);

        const boundingRect = highlightEl.getBoundingClientRect();
        // TODO: Move some of this logic to hoverTools:
        onHighlightMouseEnterOrClick({
            'type': 'click',
            'target': highlightEl,
            'clientX': boundingRect.left + (boundingRect.width / 2),
        });
    }
}

export default show;
