import { loadAll as loadAllFromStorage } from '../utils/storageManager.js';

function loadAll() {
    function loadAllHighlightsOnPage() {
        loadAllFromStorage(window.location.hostname + window.location.pathname, window.location.pathname);
    }

    if (document.readyState === 'loading') {
        document.removeEventListener('DOMContentLoaded', loadAllHighlightsOnPage); // Prevent duplicates
        document.addEventListener('DOMContentLoaded', loadAllHighlightsOnPage);
    } else {
        // Run immediately if the page is already loaded
        loadAllHighlightsOnPage();
    }
}

export default loadAll;
