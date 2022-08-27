import highlight from './highlight/index.js';
import { store } from './utils/storageManager.js';

function highlightSelectedText() {
    const selection = window.getSelection();
    const selectionString = selection.toString();

    if (selectionString) { // If there is text selected

        let container = selection.getRangeAt(0).commonAncestorContainer;

        // Sometimes the element will only be text. Get the parent in that case
        // TODO: Is this really necessary?
        while (!container.innerHTML) {
            container = container.parentNode;
        }

        chrome.runtime.sendMessage({ action: 'get-current-color' }, ({ response: color }) => {
            store(selection, container, location.hostname + location.pathname, location.href, color.color, color.textColor, (highlightIndex) => {
                highlight(selectionString, container, selection, color.color, color.textColor, highlightIndex);
            });
        });
    }
}

export default highlightSelectedText;
