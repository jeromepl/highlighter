import * as api from './api.js';
import { initializeHighlighterCursor } from './highlighterCursor/index.js';
import { loadAll as loadAllHighlights } from './highlights/index.js';
import { initializeHoverTools } from './hoverTools/index.js';

function initialize() {
    initializeHoverTools();
    initializeHighlighterCursor();
    exposeAPI();
    loadAllHighlights();
}

// Expose globals needed for scripts injected from the background service worker
function exposeAPI() {
    window.highlighterAPI = api;
}

export { initialize };
