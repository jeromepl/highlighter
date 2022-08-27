import { executeInCurrentTab } from '../utils.js';

function getHighlights() {
    function contentScriptGetHighlights() {
        return window.highligherAPI.getPageHighlights();
    }

    return executeInCurrentTab({ func: contentScriptGetHighlights });
}

export default getHighlights;
