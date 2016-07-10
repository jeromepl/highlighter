"use strict";

function highlightText() {
    chrome.extension.getBackgroundPage().highlightText();
}
function removeHighlights() {
    chrome.extension.getBackgroundPage().removeHighlights();
}

var highlightBtn = document.getElementById('highlight');
var removeHighlightsBtn = document.getElementById('remove-highlights');

// Register Events
highlightBtn.addEventListener('click', highlightText);
removeHighlightsBtn.addEventListener('click', removeHighlights);

// TODO: Determine if the buttons should be enabled or disabled
highlightBtn.disabled = false;
removeHighlightsBtn.disabled = false;
