"use strict";

var hoverToolEl = null;
var hoverToolTimeout = null;
var currentHighlightEl = null;
var highlightClicked = false;
var copyBtnEl = null;
var deleteBtnEl = null;

$.get(chrome.extension.getURL('hoverTools.html'), function(data) {
    hoverToolEl = $(data);
    hoverToolEl.hide().appendTo('body');
    hoverToolEl[0].addEventListener('mouseenter', onHoverToolMouseEnter);
    hoverToolEl[0].addEventListener('mouseleave', onHighlightMouseLeave);

    copyBtnEl = hoverToolEl.find('.highlighter--icon-copy')[0];
    deleteBtnEl = hoverToolEl.find('.highlighter--icon-delete')[0];
    copyBtnEl.addEventListener('click', onCopyBtnClicked);
    deleteBtnEl.addEventListener('click', onDeleteBtnClicked);
});

// Allow clicking outside of a highlight to unselect
window.addEventListener('click', function (e) {
    if (e.target.classList.contains('highlighter--highlighted')) return;
    hide();
});

window.addEventListener("scroll", function (e) {
    if (highlightClicked) {
        moveToolbarToHighlight(currentHighlightEl);
    }
});

function onHighlightMouseEnterOrClick(e) {
    const newHighlightEl = e.target;
    const newHighlightId = newHighlightEl.getAttribute('data-highlight-id');

    // If the previous action was a click but now it's a mouseenter, don't do anything
    if (highlightClicked && e.type !== 'click') return;

    highlightClicked = e.type === 'click';

    // Clear any previous timeout that would hide the toolbar, and 
    if (hoverToolTimeout !== null) {
        clearTimeout(hoverToolTimeout);
        hoverToolTimeout = null;

        if (newHighlightId === currentHighlightEl.getAttribute('data-highlight-id')) return;
    }

    currentHighlightEl = newHighlightEl;

    // Position (and show) the hover toolbar above the highlight
    moveToolbarToHighlight(newHighlightEl, e.clientX);

    // Remove any previous borders and add a border to the highlight (by id) to clearly see what was selected
    $('.highlighter--hovered').removeClass('highlighter--hovered');
    $(`.highlighter--highlighted[data-highlight-id='${newHighlightId}']`).addClass('highlighter--hovered');
}

function onHighlightMouseLeave(e) {
    if (!highlightClicked) {
        hoverToolTimeout = setTimeout(hide, 170);
    }
}

function moveToolbarToHighlight(highlightEl, cursorX) { // cursorX is optional, in which case no change is made to the x position of the hover toolbar
    const boundingRect = highlightEl.getBoundingClientRect();
    const toolWidth = 82;

    const hoverTop = boundingRect.top - 45;
    hoverToolEl.css({ top: hoverTop });
    
    if (cursorX !== undefined) {
        let hoverLeft = null;
        if (boundingRect.width < toolWidth) {
            // center the toolbar if the highlight is smaller than the toolbar
            hoverLeft = boundingRect.left + boundingRect.width / 2 - toolWidth / 2
        } else if (cursorX - boundingRect.left < toolWidth / 2) {
            // If the toolbar would overflow the highlight on the left, snap it to the left of the highlight
            hoverLeft = boundingRect.left;
        } else if (boundingRect.right - cursorX < toolWidth / 2) {
            // If the toolbar would overflow the highlight on the right, snap it to the right of the highlight
            hoverLeft = boundingRect.right - toolWidth;
        } else {
            // Else, center the toolbar above the cursor
            hoverLeft = cursorX - toolWidth / 2;
        }

        hoverToolEl.css({ left: hoverLeft });
    }

    hoverToolEl.show()
}

function hide() {
    $('.highlighter--hovered').removeClass('highlighter--hovered');
    hoverToolEl.hide();
    hoverToolTimeout = null;
    highlightClicked = false;
}

function onHoverToolMouseEnter(e) {
    if (hoverToolTimeout !== null) {
        clearTimeout(hoverToolTimeout);
        hoverToolTimeout = null;
    }
}

function onCopyBtnClicked(e) {
    const highlightId = currentHighlightEl.getAttribute('data-highlight-id');
    const highlights = document.querySelectorAll(`.highlighter--highlighted[data-highlight-id='${highlightId}']`);
    const highlightText = Array.from(highlights).map((el) => el.textContent.replace(/\s+/gm, ' ')).join(''); // clean up whitespace
    navigator.clipboard.writeText(highlightText);
    chrome.runtime.sendMessage({ action: 'track-event', trackCategory: 'highlight-action', trackAction: 'copy' });
}

function onDeleteBtnClicked(e) {
    const highlightId = currentHighlightEl.getAttribute('data-highlight-id');
    const highlights = $(`.highlighter--highlighted[data-highlight-id='${highlightId}']`);
    $('.highlighter--hovered').removeClass('highlighter--hovered');
    hoverToolEl.hide();
    hoverToolTimeout = null;

    highlights.css('backgroundColor', 'inherit'); // Change the background color attribute
    highlights.removeClass(HIGHLIGHT_CLASS).addClass(DELETED_CLASS); // Change the class name to the 'deleted' version
    update(highlightId, window.location.hostname + window.location.pathname, window.location.pathname, 'inherit'); // update the value in the local storage

    highlights.each((_, el) => { // Finally, remove the event listeners that were attached to this highlight element
        el.removeEventListener('mouseenter', onHighlightMouseEnterOrClick);
        el.removeEventListener('click', onHighlightMouseEnterOrClick);
        el.removeEventListener('mouseleave', onHighlightMouseLeave);
    });

    chrome.runtime.sendMessage({ action: 'track-event', trackCategory: 'highlight-action', trackAction: 'delete' });
}
