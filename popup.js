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

// TODO: Determine if the buttons should be enabled or disabled
highlightBtn.disabled = false;
removeHighlightsBtn.disabled = false;

function clearSelected() {
    var selected = document.getElementsByClassName('selected');
    for (var i = 0; i < selected.length; i++) {
        selected[i].classList.remove('selected');
    }
}
