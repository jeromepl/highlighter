"use strict";

var STORE_FORMAT_VERSION = chrome.runtime.getManifest().version;

var alternativeUrlIndexOffset = 0; // Number of elements stored in the alternativeUrl Key. Used to map highlight indices to correct key

function store(selection, container, url, color, callback) {
    chrome.storage.local.get({ highlights: {} }, (result) => {
        const highlights = result.highlights;

        if (!highlights[url])
            highlights[url] = [];

        const count = highlights[url].push({
            version: STORE_FORMAT_VERSION,
            string: selection.toString(),
            container: getQuery(container),
            anchorNode: getQuery(selection.anchorNode),
            anchorOffset: selection.anchorOffset,
            focusNode: getQuery(selection.focusNode),
            focusOffset: selection.focusOffset,
            color: color
        });
        chrome.storage.local.set({ highlights });

        if (callback)
            callback(count - 1 + alternativeUrlIndexOffset);
    });
}

function update(highlightIndex, url, alternativeUrl, newColor) {
    chrome.storage.local.get({ highlights: {} }, (result) => {
        const highlights = result.highlights;

        let urlToUse = url;
        let indexToUse = highlightIndex - alternativeUrlIndexOffset;
        if (highlightIndex < alternativeUrlIndexOffset) {
            urlToUse = alternativeUrl;
            indexToUse = highlightIndex;
        }

        const highlightsInKey = highlights[urlToUse];
        if (highlightsInKey) {
            const highlight = highlightsInKey[indexToUse];
            if (highlight) {
                highlight.color = newColor;
                chrome.storage.local.set({ highlights });
            }
        }
    });
}

function loadAll(url, alternativeUrl) { // alternativeUrl is optional
    chrome.storage.local.get({ highlights: {} }, function (result) {
        let highlights = [];

        // Because of a bug in an older version of the code, some highlights were stored
        // using a key that didn't correspond to the full page URL. To fix this, if the
        // alternativeUrl exists, try to load highlights from there as well 
        if (alternativeUrl) {
            highlights = highlights.concat(result.highlights[alternativeUrl] || []);
        }
        alternativeUrlIndexOffset = highlights.length;

        highlights = highlights.concat(result.highlights[url] || []);

        for (let i = 0; highlights && i < highlights.length; i++) {
            load(highlights[i], i);
        }
    });
}

function load(highlightVal, highlightIndex, noErrorTracking) { // noErrorTracking is optional
    const selection = {
        anchorNode: elementFromQuery(highlightVal.anchorNode),
        anchorOffset: highlightVal.anchorOffset,
        focusNode: elementFromQuery(highlightVal.focusNode),
        focusOffset: highlightVal.focusOffset
    };

    // Starting with version 3.1.0, a new highlighting system was used which modifies the DOM in place
    const loadLegacy = versionCompare(highlightVal.version, "3.1.0") < 0;

    const selectionString = highlightVal.string;
    const container = elementFromQuery(highlightVal.container);
    const color = highlightVal.color;

    if (!selection.anchorNode || !selection.focusNode || !container) {
        if (!noErrorTracking) {
            addHighlightError(highlightVal, highlightIndex);
        }
        return false;
    } else {
        let success = false;
        if (loadLegacy) {
            success = highlight_legacy(selectionString, container, selection, color, highlightIndex);
        } else {
            success = highlight(selectionString, container, selection, color, highlightIndex);
        }

        if (!noErrorTracking && !success) {
            addHighlightError(highlightVal, highlightIndex);
        }
        return success;
    }
}

function clearPage(url, alternativeUrl) { // alternativeUrl is optional
    chrome.storage.local.get({ highlights: {} }, (result) => {
        const highlights = result.highlights;
        delete highlights[url];

        if (alternativeUrl) // See 'loadAll()' for an explaination of why this is necessary
            delete highlights[alternativeUrl];

        chrome.storage.local.set({ highlights });
    });
}

function elementFromQuery(storedQuery) {
    const re = />textNode:nth-of-type\(([0-9]+)\)$/i;
    const result = re.exec(storedQuery);

    if (result) { // For text nodes, nth-of-type needs to be handled differently (not a valid CSS selector)
        const textNodeIndex = parseInt(result[1]);
        storedQuery = storedQuery.replace(re, "");
        const parent = $(storedQuery)[0];
        if (!parent)
            return undefined;
        return parent.childNodes[textNodeIndex];
    } else {
        return $(storedQuery)[0];
    }
}

// From an DOM element, get a query to that DOM element
function getQuery(element) {
    if (element.id)
        return '#' + escapeCSSString(element.id);
    if (element.localName === 'html')
        return 'html';

    const parent = element.parentNode;

    let index;
    const parentSelector = getQuery(parent);
    // The element is a text node
    if (!element.localName) {
        // Find the index of the text node:
        index = Array.prototype.indexOf.call(parent.childNodes, element);
        return parentSelector + '>textNode:nth-of-type(' + index + ')';
    } else {
        const jEl = $(element);
        index = jEl.parent().find('>' + element.localName).index(jEl) + 1;
        return parentSelector + '>' + element.localName + ':nth-of-type(' + index + ')';
    }
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString) {
    return cssString.replace(/(:)/g, "\\$1");
}

// Compare two manifest version strings, e.g. "3.1.0" > "2.0.4"
// Returns 1 if v1 is greater than v2, -1 if smaller and 0 if equal
// Counts an 'undefined' version as if it was the smallest possible
function versionCompare(v1, v2) {
    if (v1 === undefined && v2 === undefined) return 0;
    if (v1 === undefined) return -1;
    if (v2 === undefined) return 1;

    const v1Numbers = v1.split('.').map(numStr => parseInt(numStr));
    const v2Numbers = v2.split('.').map(numStr => parseInt(numStr));

    const v1Len = v1Numbers.length, v2Len = v2Numbers.length;

    for (let i = 0; i < Math.min(v1Len, v2Len); i++) {
        if (v1Numbers[i] !== v2Numbers[i]) {
            return (v1Numbers[i] > v2Numbers[i]) ? 1 : -1;
        }
    }

    // If all numbers matched but one string has more numbers then it is newer
    if (v1Len !== v2Len) return (v1Len > v2Len) ? 1 : -1;

    return 0; // Everything is equal
}
