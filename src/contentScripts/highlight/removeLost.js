import { removeLostHighlight } from "../utils/errorManager.js";
import { removeHighlight as removeHighlightFromStorage } from "../utils/storageManager.js";

function removeLost(highlightId) {
    removeLostHighlight(highlightId);
    removeHighlightFromStorage(highlightId, window.location.hostname + window.location.pathname, window.location.pathname);
}

export default removeLost;
