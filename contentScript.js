"use strict";

var selection = window.getSelection();

console.log(selection);
console.log(selection.toString());

// Pick a combination of characters that should (almost) never occur
var DELIMITERS = {
    start: '~:;',
    end: ';:~'
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

if(selection.toString()) { //If there is text selected

    var container = $(selection.getRangeAt(0).commonAncestorContainer);

    // Sometimes the element will only be text. Get the parent in that case
    while(!container.html()) {
        container = container.parent();
    }

    // In order to get the correct length, we need to remove all line break characters
    selectionLength = selection.toString().replace(/\x0A/g, '').length;
    //selectionLength = selection.toString().length;

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
    *
    * NOTE: A Document fragment could possibly be used here for efficiency
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
            if(!startFound) {
                if (anchor.is(element)) {
                    startFound = true;
                    startIndex = anchorOffset;
                }
                else if (focus.is(element)) {
                    startFound = true;
                    startIndex = focusOffset;
                }
            }

            // Step 2:
            if (startFound && charsHighlighted < selectionLength) { // && !element.nodeValue.match(/^\s*$/)) {
                var nodeValueLength = element.nodeValue.length;

                if (charsHighlighted + nodeValueLength - startIndex <= selectionLength) {
                    charsHighlighted += nodeValueLength - startIndex;
                    element.nodeValue = element.nodeValue.substr(0, startIndex) + DELIMITERS.start + element.nodeValue.substr(startIndex) + DELIMITERS.end;
                }
                else {
                    var charsLeftToHighlight = selectionLength - charsHighlighted;
                    charsHighlighted += charsLeftToHighlight;
                    element.nodeValue = element.nodeValue.substr(0, startIndex) + DELIMITERS.start + element.nodeValue.substr(startIndex, charsLeftToHighlight) +
                        DELIMITERS.end + element.nodeValue.substr(charsLeftToHighlight + startIndex);
                }
            }
            /*else if (startFound && charsHighlighted < selectionLength) {
                charsHighlighted += element.nodeValue.split(String.fromCharCode(10)).length - 1;

                for (var i = 0; i < element.nodeValue.length; i++) {
                    if (element.nodeValue.charCodeAt(i) < 32)
                        console.log(element.nodeValue.charCodeAt(i));
                }
            }*/
        }
        else
            recursiveWrapper($(element))
    });
}


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
