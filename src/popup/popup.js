"use strict";

const highlightBtn = document.getElementById('highlight');
const removeHighlightsBtn = document.getElementById('remove-highlights');
const radios = document.getElementsByName('color');
const shortcutLink = document.getElementById('shortcut-link');
const highlightCommandEl = document.getElementById('highlight-command');
const shortcutTextEl = document.getElementById('shortcut-text');
const refreshWarningEl = document.getElementById('refresh-warning');
const closeWarningBtn = document.getElementById('close-warning');
const askConfirmationEl = document.getElementById('remove-ask-confirmation');
const removeConfirmBtn = document.getElementById('remove-confirm');
const removeCancelBtn = document.getElementById('remove-cancel');
const copyBtn = document.getElementById('copy-highlights');
const highlightsListEl = document.getElementById('highlights-list');

function askConfirmation() {
    // Ask confirmation to remove all highlights on the page
    removeHighlightsBtn.style.display = 'none';
    askConfirmationEl.style.display = 'block';
}

function closeConfirmation() {
    removeHighlightsBtn.style.display = 'block';
    askConfirmationEl.style.display = 'none';
}

function removeHighlights() {
    chrome.runtime.sendMessage({ action: 'remove-highlights' });
    window.close(); // Closing here also allows automatic refreshing of the highlight list
}

function colorChanged(color) {
    chrome.runtime.sendMessage({ action: 'change-color', color, source: 'popup' });
}

function toggleHighlighterCursor() {
    chrome.runtime.sendMessage({ action: 'toggle-highlighter-cursor', source: 'popup' });
    window.close();
}

(function preventWarning() {
    // Do not show the warning message on future popup window opens after a user has clicked the 'x' button once
    if (window.localStorage.getItem('refresh-warning-closed')) {
        refreshWarningEl.remove();
    }
})(); // Automatically trigger. function added for clarity only

function closeWarning() {
    refreshWarningEl.remove();
    window.localStorage.setItem('refresh-warning-closed', true);
}

function copyHighlights() {
    window.getSelection().selectAllChildren(highlightsListEl);
    document.execCommand("copy");
    window.getSelection().empty();

    chrome.runtime.sendMessage({ action: 'track-event', trackCategory: 'highlight-action', trackAction: 'copy-all' });

    // Let the user know the copy went through
    const checkmarkEl = document.createElement('span');
    checkmarkEl.style.color = '#00ff00';
    checkmarkEl.innerHTML = ' &#10004;';
    copyBtn.appendChild(checkmarkEl);
}

(async function getHighlights() {
    chrome.runtime.sendMessage({ action: 'get-highlights' }, (highlights) => {
        if (!Array.isArray(highlights)) return;
        if (highlights.length == 0) {
            copyBtn.disabled = true;
            removeHighlightsBtn.disabled = true;
            return;
        }

        // Clear previous list elements, but only if there is at least one otherwise leave the "empty" message
        highlightsListEl.innerHTML = '';

        // Populate with new elements
        for (let i = 0; i < highlights.length; i += 2) {
            const newEl = document.createElement('li');
            newEl.innerText = highlights[i + 1];
            const highlightId = highlights[i];
            newEl.addEventListener('click', () => {
                chrome.runtime.sendMessage({ action: 'show-highlight', highlightId });
            });
            highlightsListEl.appendChild(newEl);
        }
    });
})(); // Automatically trigger. function added for clarity only

// Register Events
highlightBtn.addEventListener('click', toggleHighlighterCursor);
removeHighlightsBtn.addEventListener('click', askConfirmation);
closeWarningBtn.addEventListener('click', closeWarning);
removeConfirmBtn.addEventListener('click', removeHighlights);
removeCancelBtn.addEventListener('click', closeConfirmation);
copyBtn.addEventListener('click', copyHighlights);

chrome.storage.sync.get('color', (values) => {
    const color = values.color;

    radios.forEach((radio) => {
        radio.addEventListener("click", (e) => { // Add event listener
            colorChanged(e.target.value);
            clearSelected();
            e.target.parentNode.classList.add('selected');
        });

        if (radio.value === color) { // Highlight the currently selected color saved in chrome storage
            clearSelected();
            radio.parentNode.classList.add('selected');
        }
    });
});

shortcutLink.addEventListener('click', () => { // Open the shortcuts Chrome settings page in a new tab
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});

// Retrieve the shortcut for the highlight command from the Chrome settings and display it
chrome.commands.getAll((commands) => {
    commands.forEach((command) => {
        if (command.name === 'execute-highlight') {
            if (command.shortcut) {
                highlightCommandEl.textContent = command.shortcut;
            } else {
                shortcutTextEl.textContent = "No keyboard shortcut is currently defined."; // If no shortcut is defined, change the whole text to reflect this
            }
        }
    });
});

// Register (in analytics) that the popup was opened
chrome.runtime.sendMessage({ action: 'track-event', trackCategory: 'popup', trackAction: 'opened' });

closeConfirmation(); // Trigger initially to hide the 'remove confirmation' section

function clearSelected() {
    const selecteds = document.getElementsByClassName('selected');
    selecteds.forEach((selected) => {
        selected.classList.remove('selected');
    });
}
