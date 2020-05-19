"use strict";

var backgroundPage = chrome.extension.getBackgroundPage();

var highlightBtn = document.getElementById('highlight');
var removeHighlightsBtn = document.getElementById('remove-highlights');
var radios = document.getElementsByName('color');
var shortcutLink = document.getElementById('shortcut-link');
var highlightCommandEl = document.getElementById('highlight-command');
var shortcutTextEl = document.getElementById('shortcut-text');
var refreshWarningEl = document.getElementById('refresh-warning');
var closeWarningBtn = document.getElementById('close-warning');
var askConfirmationEl = document.getElementById('remove-ask-confirmation');
var removeConfirmBtn = document.getElementById('remove-confirm');
var removeCancelBtn = document.getElementById('remove-cancel');
var copyBtn = document.getElementById('copy-highlights');
var highlightsListEl = document.getElementById('highlights-list');

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
    backgroundPage.removeHighlights();
    window.close(); // Closing here also allows automatic refreshing of the highlight list
}

function colorChanged(color) {
    backgroundPage.trackEvent('color-change-source', 'popup');
    backgroundPage.changeColor(color);
}

function toggleHighlighterCursor() {
    backgroundPage.trackEvent('toggle-cursor-source', 'popup');
    backgroundPage.toggleHighlighterCursor();
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
    
    backgroundPage.trackEvent('highlight-action', 'copy-all');

    // Let the user know the copy went through
    var checkmarkEl = document.createElement('span');
    checkmarkEl.style.color = '#00ff00';
    checkmarkEl.innerHTML = ' &#10004;';
    copyBtn.appendChild(checkmarkEl);
}

(function getHighlights() {
    chrome.tabs.executeScript({file: 'contentScripts/getHighlights.js'}, (results) => {
        if (!results || !Array.isArray(results) || results.length == 0) return;
        if (results[0].length == 0) {
            copyBtn.disabled = true;
            removeHighlightsBtn.disabled = true;
            return;
        } 

        var highlights = results[0];

        // Clear previous list elements, but only if there is at least one otherwise leave the "empty" message
        highlightsListEl.innerHTML = '';
        
        // Populate with new elements
        for (var i = 0; i < highlights.length; i += 2) {
            var newEl = document.createElement('li');
            newEl.innerText = highlights[i + 1];
            let highlightId = highlights[i];
            newEl.addEventListener('click', (e) => {
                backgroundPage.showHighlight(highlightId);
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
    var color = values.color;

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
backgroundPage.trackEvent('popup', 'opened');

closeConfirmation(); // Trigger initially to hide the 'remove confirmation' section

function clearSelected() {
    var selected = document.getElementsByClassName('selected');
    for (var i = 0; i < selected.length; i++) {
        selected[i].classList.remove('selected');
    }
}
