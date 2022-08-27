import api from './api.js';
import { initializeHighlighterCursor } from './highlighterCursor.js';
import { initializeHoverTools } from './hoverTools/index.js';
import loadPageHighlights from "./loadPageHighlights.js";

export function initialize() {
    initializeHoverTools();
    initializeHighlighterCursor();
    exposeAPI();
    loadPageHighlights();
}

// Expose globals needed for scripts injected from the background service worker
function exposeAPI() {
    window.highlighterAPI = api;
}
