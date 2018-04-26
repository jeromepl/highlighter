"use strict";

function highlightText() {
    chrome.extension.getBackgroundPage().highlightText();
}
function removeHighlights() {
    chrome.extension.getBackgroundPage().removeHighlights();
}

function colorChanged(color) {
    chrome.extension.getBackgroundPage().changeColor(color);
}

var highlightBtn = document.getElementById('highlight');
var removeHighlightsBtn = document.getElementById('remove-highlights');
var radios = document.getElementsByName('color');
var shortcutLink = document.getElementById('shortcut-link');
var highlightCommandEl = document.getElementById('highlight-command');
var shortcutTextEl = document.getElementById('shortcut-text');

// Register Events
highlightBtn.addEventListener('click', highlightText);
removeHighlightsBtn.addEventListener('click', removeHighlights);

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

// TODO: Determine if the buttons should be enabled or disabled
highlightBtn.disabled = false;
removeHighlightsBtn.disabled = false;

function clearSelected() {
    var selected = document.getElementsByClassName('selected');
    for (var i = 0; i < selected.length; i++) {
        selected[i].classList.remove('selected');
    }
}
