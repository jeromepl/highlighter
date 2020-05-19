"use strict";

var highlights = document.getElementsByClassName('highlighter--highlighted');

var textToCopy = new Map(); // Use a Map instead of an object since it retains order of insertion

for (var i = 0; i < highlights.length; i++) {
    var dataHighlightId = highlights[i].getAttribute('data-highlight-id');
    if (textToCopy.has(dataHighlightId)) {
        textToCopy.set(dataHighlightId, textToCopy.get(dataHighlightId).concat(highlights[i].textContent));
    } else {
        textToCopy.set(dataHighlightId, [highlights[i].textContent]);
    }
}

// Join all strings corresponding to the same highlight together
// Also, return an array instead of a Map since for some reason Maps don't get returned properly (serialization issue?)
// Note that we could return a dict instead, but that we would lose ordering
var highlightsText = [];
for (var [key, value] of textToCopy){
    var highlightText = value.map((text) => text.replace(/\s+/gm, ' ')).join(''); // clean up whitespace

    highlightsText.push(parseInt(key));
    highlightsText.push(highlightText);
}

highlightsText; // Return
