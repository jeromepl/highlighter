import { executeInCurrentTab } from '../utils.js';

function getLostHighlights() {
    function contentScriptGetLostHighlights() {
        const lostHighlights = [];
        window.highlighterAPI.getLostHighlights().forEach((highlight, index) => lostHighlights.push({ string: highlight?.string, index }));
        return lostHighlights;
    }

    return executeInCurrentTab({ func: contentScriptGetLostHighlights });
}

export default getLostHighlights;
