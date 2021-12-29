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
    checkmarkEl.innerHTML = ' &#10004;';
    copyAllButton.prepend(checkmarkEl);
}

(async function initializeHighlightsList() {
    const highlights = await getFromBackgroundPage({ action: 'get-highlights' });

    if (!Array.isArray(highlights) || highlights.length == 0) return;

    // Clear previous list elements, but only if there is at least one otherwise leave the "empty" message
    highlightsListElement.innerHTML = '';

    // Populate with new elements
    for (let i = 0; i < highlights.length; i += 2) {
        const newEl = document.createElement('div');
        newEl.classList.add("highlight");
        newEl.innerText = highlights[i + 1];
        const highlightId = highlights[i];
        newEl.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'show-highlight', highlightId });
        });
        highlightsListElement.appendChild(newEl);
    }
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
