import { onHighlightMouseEnterOrClick } from './hoverTools/index.js';

function showHighlight(highlightId) {
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

export default showHighlight;
