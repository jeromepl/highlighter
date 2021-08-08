"use strict";

// Pick a combination of characters that should (almost) never occur
var DELIMITERS = {
    start: '~|:;',
    end: ';:~|',
};

var REPLACEMENT_START_RE = `<span class="(${escapeRegex(HIGHLIGHT_CLASS)}|${escapeRegex(DELETED_CLASS)})" style="background-color: [a-z]+;"( data-highlight-id="[0-9]+")?>`;
var REPLACEMENT_END = '</span>';
var REPLACEMENT_END_RE = escapeRegex(REPLACEMENT_END);

function getReplacements(color, highlightIndex) {
    // deleted highlights have background-color: 'inherit'
    const className = (color === 'inherit') ? DELETED_CLASS : HIGHLIGHT_CLASS;
    return {
        start: `<span class="${className}" style="background-color: ${color};" data-highlight-id="${highlightIndex}">`,
        end: REPLACEMENT_END,
    };
}

let anchorNode = null, focusNode = null;
let anchorOffset = 0, focusOffset = 0;
let selectionString = "";
let selectionLength = 0;

let startFound = false;
let charsHighlighted = 0;

let alreadyHighlighted = true;

function _resetVars() {
    startFound = false;
    charsHighlighted = 0;
    alreadyHighlighted = true;
}

function highlight_legacy(selString, container, selection, color, highlightIndex) { /* eslint-disable-line no-redeclare, no-unused-vars, camelcase */
    _resetVars();

    selectionString = selString;
    selectionLength = selectionString.length;

    container = $(container);
    anchorNode = $(selection.anchorNode);
    anchorOffset = selection.anchorOffset;
    focusNode = $(selection.focusNode);
    focusOffset = selection.focusOffset;

    /**
    * STEPS:
    * 1 - Use the offset of the anchor/focus to find the start of the selected text in the anchor/focus element
    *     - Use the first of the anchor of the focus elements to appear
    * 2 - From there, go through the elements and find all Text Nodes until the selected text is all found.
    *     - Wrap all the text nodes (or parts of them) in special characters
    * 3 - Replace the special characters by span tags with a yellow background color in the container html
    * 4 - Deselect text
    */

    // Step 1 + 2:
    recursiveWrapper_legacy(container);

    color = color ? color : "yellow";
    const replacements = getReplacements(color, highlightIndex);

    // Step 3:
    // Either highlight, or un-highlight the selection

    // Need to take the parent in order to be able to open and close the container's root element (a <span> in the un-highlight case)
    // Also needed for the negative lookahead of the highlight case
    const parent = container.parent();
    let content = parent.html();

    let startRe = null, endRe = null, sanitizeRe = null;
    if (!alreadyHighlighted) {
        startRe = new RegExp(escapeRegex(DELIMITERS.start), "ug");
        endRe = new RegExp(escapeRegex(DELIMITERS.end), "ug");
        content = content.replace(startRe, replacements.start).replace(endRe, replacements.end);
        parent.html(content);
    } else {
        startRe = new RegExp(escapeRegex(DELIMITERS.start), "ug");
        endRe = new RegExp(escapeRegex(DELIMITERS.end), "ug");

        // The trick here is to replace the start with the end and vice-versa which will remove the selected text from the highlight
        content = content.replace(startRe, replacements.end).replace(endRe, replacements.start);

        // Clean-up by removing empty spans
        // NOTE: This sanitization step could be removed entirely if needed
        sanitizeRe = new RegExp(REPLACEMENT_START_RE + REPLACEMENT_END_RE, "ug");
        parent.html(content.replace(sanitizeRe, ''));
    }

    // Step 4:
    if (selection.removeAllRanges) selection.removeAllRanges();

    // Attach mouse hover event listeners to display tools when hovering a highlight
    parent.find(`.${HIGHLIGHT_CLASS}`).each((i, el) => {
        el.addEventListener('mouseenter', onHighlightMouseEnterOrClick);
        el.addEventListener('click', onHighlightMouseEnterOrClick);
        el.addEventListener('mouseleave', onHighlightMouseLeave);
    });

    return true; // No errors. 'undefined' is returned by default if any error occurs during this method's execution, like if 'content.replace' fails by 'content' being 'undefined'
}

function recursiveWrapper_legacy(container) { /* eslint-disable-line camelcase */

    container.contents().each((index, element) => {
        if (element.nodeType === Node.TEXT_NODE) {
            let startIndex = 0;

            // Step 1:
            // The first element to appear could be the anchor OR the focus node,
            // since you can highlight from left to right or right to left
            if (!startFound) {
                if (anchorNode.is(element)) {
                    startFound = true;
                    startIndex = anchorOffset;
                }
                if (focusNode.is(element)) {
                    if (startFound) { // If the anchor and the focus elements are the same, use the smallest index
                        startIndex = Math.min(anchorOffset, focusOffset);
                    } else {
                        startFound = true;
                        startIndex = focusOffset;
                    }
                }
            }

            // Step 2:
            if (startFound && charsHighlighted < selectionLength) {
                const nodeValueLength = element.nodeValue.length;
                let newText = "";

                // If one of the textElement is not wrapped in a .highlighter--highlighted span,
                // the selection is not already highlighted
                const parent = element.parentElement;
                if (parent.nodeName !== 'SPAN' || !parent.classList.contains(HIGHLIGHT_CLASS)) {
                    alreadyHighlighted = false;
                }

                // Go over all characters to see if they match the selection.
                // This is done because the selection text and node text contents differ.
                for (let i = 0; i < nodeValueLength; i++) {
                    if (i === startIndex) {
                        newText += DELIMITERS.start;
                    }
                    if (charsHighlighted === selectionLength) {
                        newText += DELIMITERS.end;
                        newText += element.nodeValue.substr(i);
                        break;
                    }

                    newText += element.nodeValue[i];

                    if (i >= startIndex && charsHighlighted < selectionLength) {
                        // Skip whitespaces as they often cause trouble (differences between selection and actual text)
                        while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/u)) {
                            charsHighlighted++;
                        }

                        if (selectionString[charsHighlighted] === element.nodeValue[i]) {
                            charsHighlighted++;
                        }
                    }

                    if (i === nodeValueLength - 1) {
                        newText += DELIMITERS.end;
                    }
                }

                element.nodeValue = newText;
            }
        } else {
            recursiveWrapper_legacy($(element));
        }
    });
}


/** UTILS **/

// Escape Regex special characters
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/ug, "\\$&");
}
