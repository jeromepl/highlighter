import { executeInCurrentTab } from '../utils.js';

function getHighlights() {
    function contentScriptGetHighlights() {
        const highlightsMap = window.highlighterAPI.highlights.getAllFound();

        // Return an array instead of a Map since for some reason Maps don't get returned properly (serialization issue?)
        // Note that we could return a dict instead, but that we would lose ordering
        return Array.from(highlightsMap);
    }

    return executeInCurrentTab({ func: contentScriptGetHighlights });
}

export default getHighlights;
