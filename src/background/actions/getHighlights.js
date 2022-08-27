import { executeInCurrentTab } from '../utils.js';

function getHighlights() {
    function contentScriptGetHighlights() {
        return window.highlighterAPI.getPageHighlights();
    }

    return executeInCurrentTab({ func: contentScriptGetHighlights });
}

export default getHighlights;
