import { executeInCurrentTab } from '../utils.js';

function getLostHighlights() {
    function contentScriptGetLostHighlights() {
        const lostHighlights = [];
        window.highlighter_lostHighlights.forEach((highlight, index) => lostHighlights.push({ string: highlight?.string, index }));
        return lostHighlights;
    }

    return executeInCurrentTab({ func: contentScriptGetLostHighlights });
}

export default getLostHighlights;
