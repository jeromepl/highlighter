import { getFromBackgroundPage } from "./utils.js";
import { open as openRemoveAllModal } from "./remove-all-modal.js";
import { open as openChangeColorModal } from "./change-color-modal.js";


const highlightButton = document.getElementById('toggle-button');
const removeAllButton = document.getElementById('remove-all-button');
const copyAllButton = document.getElementById('copy-all-button');
const closeButton = document.getElementById('close-button');
const changeColorButton = document.getElementById('change-color-button');

const colorsListElement = document.getElementById('colors-list');
const selectedColorElement = document.getElementById('selected-color');
const shortcutLinkElement = document.getElementById('shortcut-link');
const shortcutLinkTextElement = document.getElementById('shortcut-link-text');
const highlightsListElement = document.getElementById('highlights-list');
const highlightsEmptyStateElement = document.getElementById('highlights-list-empty-state');
const highlightsListLostTitleElement = document.getElementById('highlights-list-lost-title');


function colorChanged(colorOption) {
    const { backgroundColor, borderColor } = colorOption.style;
    const { colorTitle } = colorOption.dataset;

    // Swap (in the UI) the previous selected color and the newly selected one
    const { backgroundColor: previousBackgroundColor, borderColor: previousBorderColor } = selectedColorElement.style;
    const { colorTitle: previousColorTitle } = selectedColorElement.dataset;
    colorOption.style.backgroundColor = previousBackgroundColor;
    colorOption.style.borderColor = previousBorderColor;
    colorOption.dataset.colorTitle = previousColorTitle;
    selectedColorElement.style.backgroundColor = backgroundColor;
    selectedColorElement.style.borderColor = borderColor;
    selectedColorElement.dataset.colorTitle = colorTitle;

    // Change the global highlighter color
    chrome.runtime.sendMessage({ action: 'change-color', color: colorTitle, source: 'popup' });
}

function toggleHighlighterCursor() {
    chrome.runtime.sendMessage({ action: 'toggle-highlighter-cursor', source: 'popup' });
    window.close();
}

function copyHighlights() {
    chrome.runtime.sendMessage({ action: 'track-event', trackCategory: 'highlight-action', trackAction: 'copy-all' });
    navigator.clipboard.writeText(highlightsListElement.innerText);

    // Let the user know the copy went through
    const checkmarkEl = document.createElement('span');
    checkmarkEl.style.color = '#00ff00';
    checkmarkEl.innerHTML = ' &#10004;'; // Checkmark character
    copyAllButton.prepend(checkmarkEl);
}

function showEmptyState() {
    if (!highlightsListElement.querySelectorAll('.highlight').length) {
        highlightsEmptyStateElement.style.display = 'flex';
    } else {
        highlightsEmptyStateElement.style.display = 'none';
    }
}

function orderHighlights() {
    highlightsListElement.querySelectorAll('.highlight').forEach((highlight) => {
        if (highlight.classList.contains('lost')) {
            // Move lost highlights to the end of the list
            highlight.remove();
            highlightsListElement.appendChild(highlight);
        }
    });
}

function showLostHighlightsTitle() {
    highlightsListLostTitleElement.remove();
    const lostHighlightElements = highlightsListElement.querySelectorAll('.lost');
    if (lostHighlightElements.length > 0) {
        highlightsListElement.insertBefore(highlightsListLostTitleElement, lostHighlightElements[0]);
    }
}

function updateHighlightsListState() {
    showEmptyState();
    orderHighlights();
    showLostHighlightsTitle();
}

(async function initializeHighlightsList() {
    const highlights = await getFromBackgroundPage({ action: 'get-highlights' });

    if (!Array.isArray(highlights) || highlights.length == 0) {
        updateHighlightsListState();
        return;
    }

    // Populate with new elements
    for (let i = 0; i < highlights.length; i += 2) {
        const newEl = document.createElement('div');
        newEl.classList.add('highlight');
        newEl.innerText = highlights[i + 1];
        const highlightId = highlights[i];
        newEl.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'show-highlight', highlightId });
        });
        highlightsListElement.appendChild(newEl);
    }

    updateHighlightsListState();
})();

(async function initializeColorsList() {
    const color = await getFromBackgroundPage({ action: 'get-current-color' });
    const colorOptions = await getFromBackgroundPage({ action: 'get-color-options' });

    colorOptions.forEach((colorOption) => {
        const colorTitle = colorOption.title;
        const selected = colorTitle === color.title;
        const colorOptionElement = selected ? selectedColorElement : document.createElement('div');

        colorOptionElement.classList.add('color');
        colorOptionElement.dataset.colorTitle = colorTitle;
        colorOptionElement.style.backgroundColor = colorOption.color;
        if (colorOption.textColor) colorOptionElement.style.borderColor = colorOption.textColor;

        if (!selected) {
            colorOptionElement.addEventListener("click", (e) => colorChanged(e.target));
            colorsListElement.appendChild(colorOptionElement);
        }
    });
})();

// Retrieve the shortcut for the highlight command from the Chrome settings and display it
(async function initializeShortcutLinkText() {
    const commands = await chrome.commands.getAll();
    commands.forEach((command) => {
        if (command.name === 'execute-highlight') {
            if (command.shortcut) {
                shortcutLinkTextElement.textContent = command.shortcut;
            } else {
                shortcutLinkTextElement.textContent = "-";
            }
        }
    });
})();

(async function initializeLostHighlights() {
    updateHighlightsListState();
    const lostHighlights = await getFromBackgroundPage({ action: 'get-lost-highlights' });

    if (!Array.isArray(lostHighlights) || lostHighlights.length == 0) {
        return;
    }

    // Populate with new elements
    lostHighlights.forEach((lostHighlight) => {
        if (!lostHighlight?.string) return;

        const newEl = document.createElement('div');
        newEl.classList.add('highlight', 'lost');
        newEl.innerText = lostHighlight.string;
        const newDeleteIconEl = document.createElement('span');
        newDeleteIconEl.classList.add('material-icons', 'delete-icon');
        newDeleteIconEl.innerText = 'delete';
        newDeleteIconEl.onclick = () => {
            chrome.runtime.sendMessage({ action: 'remove-highlight', highlightId: lostHighlight.index }, () => {
                newEl.remove();
                updateHighlightsListState();
            });
        };
        newEl.appendChild(newDeleteIconEl);
        highlightsListElement.appendChild(newEl);
    });

    updateHighlightsListState();
})();

// Register Events
highlightButton.addEventListener('click', toggleHighlighterCursor);
copyAllButton.addEventListener('click', copyHighlights);
removeAllButton.addEventListener('click', openRemoveAllModal);
changeColorButton.addEventListener('click', openChangeColorModal);
selectedColorElement.addEventListener('click', openChangeColorModal);

shortcutLinkElement.addEventListener('click', () => { // Open the shortcuts Chrome settings page in a new tab
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});

closeButton.addEventListener('click', () => window.close());

// Register (in analytics) that the popup was opened
chrome.runtime.sendMessage({ action: 'track-event', trackCategory: 'popup', trackAction: 'opened' });
