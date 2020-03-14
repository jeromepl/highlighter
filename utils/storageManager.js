"use strict";

function store(selection, container, url, color, callback) {
    chrome.storage.local.get({highlights: {}}, (result) => {
        var highlights = result.highlights;

        if (!highlights[url])
            highlights[url] = [];

        highlights[url].push({
            string: selection.toString(),
            container: getQuery(container),
            anchorNode: getQuery(selection.anchorNode),
            anchorOffset: selection.anchorOffset,
            focusNode: getQuery(selection.focusNode),
            focusOffset: selection.focusOffset,
            color: color
        });
        chrome.storage.local.set({highlights});

        if (callback)
            callback();
    });
}

function loadAll(url) {
    chrome.storage.local.get({highlights: {}}, function (result) {
        var highlights = result.highlights[url];
        for (var i = 0; highlights && i < highlights.length; i++) {
            load(highlights[i]);
        }
    });
}

function load(highlightVal, noErrorTracking) { // noErrorTracking is optional
    var selection = {
        anchorNode: elementFromQuery(highlightVal.anchorNode),
        anchorOffset: highlightVal.anchorOffset,
        focusNode: elementFromQuery(highlightVal.focusNode),
        focusOffset: highlightVal.focusOffset
    };

    var selectionString = highlightVal.string;
    var container = elementFromQuery(highlightVal.container);
    var color = highlightVal.color;

    if (!selection.anchorNode || !selection.focusNode || !container) {
        if (!noErrorTracking) {
            addHighlightError(highlightVal);
        }
        return false;
    } else {
        var success = highlight(selectionString, container, selection, color);
        if (!noErrorTracking && !success) {
            addHighlightError(highlightVal);
        }
        return success;
    }
}

function clearPage(url) {
    chrome.storage.local.get({highlights: {}}, (result) => {
        var highlights = result.highlights;
        delete highlights[url];
        chrome.storage.local.set({highlights});
    });
}

function elementFromQuery(storedQuery) {
    var re = />textNode:nth-of-type\(([0-9]+)\)$/i;
    var result = re.exec(storedQuery);

    if (result) { // For text nodes, nth-of-type needs to be handled differently (not a valid CSS selector)
        var textNodeIndex = parseInt(result[1]);
        storedQuery = storedQuery.replace(re, "");
        var parent = $(storedQuery)[0];
        if (!parent)
            return undefined;
        return parent.childNodes[textNodeIndex];
    }
    else
        return $(storedQuery)[0];
}

// From an DOM element, get a query to that DOM element
function getQuery(element) {
    if (element.id)
        return '#' + escapeCSSString(element.id);
    if (element.localName === 'html')
        return 'html';

    var parent = element.parentNode;

    var index;
    var parentSelector = getQuery(parent);
    // The element is a text node
    if (!element.localName) {
        // Find the index of the text node:
        index = Array.prototype.indexOf.call(parent.childNodes, element);

        return parentSelector + '>textNode:nth-of-type(' + index + ')';
    }
    else {
        var jEl = $(element);
        index = jEl.index(parentSelector + '>' + element.localName) + 1;
        return parentSelector + '>' + element.localName + ':nth-of-type(' + index + ')';
    }
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString) {
    return cssString.replace(/(:)/g, "\\$1");
}
