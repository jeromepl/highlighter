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
    // TODO: The better solution here is to:
    // 1) Debounce this
    // 2) check if a highlight was selected (clicked)
    // 3) if so, reposition the hover toolbar
    hide();
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

    // Position the hover toolbar above the highlight
    const boundingRect = e.target.getBoundingClientRect();
    const toolWidth = 82;
    let hoverLeft = 0;
    if (boundingRect.width < toolWidth) {
        hoverLeft = boundingRect.left + boundingRect.width / 2 - toolWidth / 2
    } else if (e.clientX - boundingRect.left < toolWidth / 2) {
        hoverLeft = boundingRect.left;
    } else if (boundingRect.right - e.clientX < toolWidth / 2) {
        hoverLeft = boundingRect.right - toolWidth;
    } else {
        hoverLeft = e.clientX - toolWidth / 2;
    }
    hoverToolEl.css({ top: boundingRect.top - 45, left: hoverLeft });
    hoverToolEl.show();

    // Remove any previous borders and add a border to the highlight (by id) to clearly see what was selected
    $('.highlighter--hovered').removeClass('highlighter--hovered');
    $(`.highlighter--highlighted[data-highlight-id='${newHighlightId}']`).addClass('highlighter--hovered');
}

function onHighlightMouseLeave(e) {
    if (!highlightClicked) {
        hoverToolTimeout = setTimeout(hide, 170);
    }
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
    $('.highlighter--hovered').removeClass('highlighter--hovered');
    hoverToolEl.hide();
    hoverToolTimeout = null;

    // FIXME TODO

    chrome.runtime.sendMessage({ action: 'track-event', trackCategory: 'highlight-action', trackAction: 'delete' });
}
