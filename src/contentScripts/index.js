import getPageHighlights from './getPageHighlights.js';
import { initializeHighlighterCursor, toggleHighlighterCursor } from './highlighterCursor.js';
import highlightSelectedText from './highlightSelectedText.js';
import { initializeHoverTools } from './hoverTools/index.js';
import loadPageHighlights from "./loadPageHighlights.js";
import showHighlight from './showHighlight.js';
import { getLostHighlights, removeLostHighlight } from './utils/errorManager.js';
import { clearPage, removeHighlight } from './utils/storageManager.js';

export function initialize() {
    initializeHoverTools();
    initializeHighlighterCursor();
    loadPageHighlights();
    exposeAPI();
}

// Expose globals needed for scripts injected from the background service worker
function exposeAPI() {
    window.clearPage = clearPage;
    window.removeHighlight = removeHighlight;
    window.showHighlight = showHighlight;
    window.toggleHighlighterCursor = toggleHighlighterCursor;
    window.getLostHighlights = getLostHighlights;
    window.removeLostHighlight = removeLostHighlight;
    window.loadPageHighlights = loadPageHighlights;
    window.highlightSelectedText = highlightSelectedText;
    window.getPageHighlights = getPageHighlights;
}
