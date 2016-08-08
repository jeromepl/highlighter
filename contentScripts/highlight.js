"use strict";

var selection = window.getSelection();
var selectionString = selection.toString();

// DEBUG
//console.log(selection);
//console.log(selectionString);

if (selectionString) { //If there is text selected

    var container = selection.getRangeAt(0).commonAncestorContainer;

    // Sometimes the element will only be text. Get the parent in that case
    // TODO: Is this really necessary?
    while (!container.innerHTML) {
        container = container.parentNode;
    }

    store(selection, container, window.location.pathname, function() {
        highlight(selectionString, container, selection);
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
