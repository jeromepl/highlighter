"use strict";

var selection = window.getSelection();
var selectionString = selection.toString();

// DEBUG
//console.log(selection);
//console.log(selectionString);

// Pick a combination of characters that should (almost) never occur
var DELIMITERS = {
    start: '~:|;',
    end: ';:~|'
};

var REPLACEMENTS = {
    start: '<span style="background-color: yellow;">',
    end: '</span>'
};

var anchor = null, focus = null;
var anchorOffset = 0, focusOffset = 0;
var selectionLength = 0;

var startFound = false;
var charsHighlighted = 0;

if(selectionString) { //If there is text selected

    var container = $(selection.getRangeAt(0).commonAncestorContainer);

    // Sometimes the element will only be text. Get the parent in that case
    // TODO: Is this really necessary?
    while (!container.html()) {
        container = container.parent();
    }

    // In order to get the correct length, we need to remove all line break characters
    //selectionLength = selectionString.replace(/\x0A/g, '').length;
    selectionLength = selectionString.length;

    anchor = $(selection.anchorNode);
    anchorOffset = selection.anchorOffset;
    focus = $(selection.focusNode);
    focusOffset = selection.focusOffset;
    var content = container.html();

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
    recursiveWrapper(container);

    // Step 3:
    var startRe = new RegExp(DELIMITERS.start, "g");
    var endRe = new RegExp(DELIMITERS.end, "g");
    container.html(container.html().replace(startRe, REPLACEMENTS.start).replace(endRe, REPLACEMENTS.end));

    // Step 4:
    selection.removeAllRanges();
}

function recursiveWrapper(container) {

    container.contents().each(function (index, element) {
        if (element.nodeType === Node.TEXT_NODE) {
            var startIndex = 0;

            // Step 1:
            // The first element to appear could be the anchor OR the focus node,
            // since you can highlight from left to right or right to left
            if (!startFound) {
                if (anchor.is(element)) {
                    startFound = true;
                    startIndex = anchorOffset;
                }
                if (focus.is(element)) {
                    if (startFound) // If the anchor and the focus elements are the same, use the smallest index
                        startIndex = Math.min(anchorOffset, focusOffset);
                    else {
                        startFound = true;
                        startIndex = focusOffset;
                    }
                }
            }

            // Step 2:
            if (startFound && charsHighlighted < selectionLength) {
                var nodeValueLength = element.nodeValue.length;
                var newText = "";

                // Go over all characters to see if they match the selection.
                // This is done because the selection text and node text contents differ.
                for (var i = 0; i < nodeValueLength; i++) {
                    if (i === startIndex)
                        newText += DELIMITERS.start;
                    if (charsHighlighted === selectionLength) {
                        newText += DELIMITERS.end;
                        newText += element.nodeValue.substr(i);
                        break;
                    }

                    newText += element.nodeValue[i];

                    if (i >= startIndex && charsHighlighted < selectionLength) {
                        // Skip whitespaces as they often cause trouble (differences between selection and actual text)
                        while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/))
                            charsHighlighted++;

                        if (selectionString[charsHighlighted] === element.nodeValue[i])
                            charsHighlighted++;
                    }

                    if (i === nodeValueLength - 1)
                        newText += DELIMITERS.end;
                }

                element.nodeValue = newText;
            }
        }
        else
            recursiveWrapper($(element))
    });
}

// The Content-Editable Way
// Using this, I get less control over the highlighting process,
// But I also get an annoying blue box for half a second indicating the 'contenteditable' mode
/*var range, sel;
try {
    if (!document.execCommand("BackColor", false, colour)) {
        makeEditableAndHighlight("yellow");
    }
} catch (ex) {
    makeEditableAndHighlight("yellow");
}

function makeEditableAndHighlight(colour) {
    sel = window.getSelection();
    if (sel.rangeCount && sel.getRangeAt) {
        range = sel.getRangeAt(0);
    }
    //document.designMode = "on";
    var container = $(sel.getRangeAt(0).commonAncestorContainer).parent();
    container.css('outline', 'none').attr('contenteditable', 'true');
    if (range) {
        sel.removeAllRanges();
        sel.addRange(range);
    }
    // Use HiliteColor since some browsers apply BackColor to the whole block
    if (!document.execCommand("HiliteColor", false, colour)) {
        document.execCommand("BackColor", false, colour);
    }
    //document.designMode = "off";
    container.attr('contenteditable', 'false').css('outline', '');
}*/
