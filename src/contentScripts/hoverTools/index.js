import {
    HIGHLIGHT_CLASS,
    updateColor as updateHighlightColor,
    remove as removeHighlight,
} from '../highlight/index.js';

let hoverToolEl = null;
let hoverToolTimeout = null;
let currentHighlightEl = null;
let highlightClicked = false;
let copyBtnEl = null;
let changeColorBtnEl = null;
let deleteBtnEl = null;

function initializeHoverTools() {
    $.get(chrome.runtime.getURL('src/contentScripts/hoverTools/index.html'), (data) => {
        hoverToolEl = $(data);
        hoverToolEl.hide();
        hoverToolEl[0].addEventListener('mouseenter', onHoverToolMouseEnter);
        hoverToolEl[0].addEventListener('mouseleave', onHighlightMouseLeave);

        copyBtnEl = hoverToolEl.find('.highlighter--icon-copy')[0];
        deleteBtnEl = hoverToolEl.find('.highlighter--icon-delete')[0];
        changeColorBtnEl = hoverToolEl.find('.highlighter--icon-change-color')[0];
        copyBtnEl.addEventListener('click', onCopyBtnClicked);
        deleteBtnEl.addEventListener('click', onDeleteBtnClicked);
        changeColorBtnEl.addEventListener('click', onChangeColorBtnClicked);
    });

    // Allow clicking outside of a highlight to unselect
    window.addEventListener('click', (e) => {
        if (e.target.classList?.contains(HIGHLIGHT_CLASS)) return;
        if (e.target.classList?.contains('highlighter--icon-change-color')) return;
        hide();
    });

    window.addEventListener("scroll", () => {
        if (highlightClicked) {
            moveToolbarToHighlight(currentHighlightEl);
        }
    });
}

function initializeHighlightEventListeners(highlightElement) {
    highlightElement.addEventListener('mouseenter', onHighlightMouseEnterOrClick);
    highlightElement.addEventListener('click', onHighlightMouseEnterOrClick);
    highlightElement.addEventListener('mouseleave', onHighlightMouseLeave);
}

function removeHighlightEventListeners(highlightElement) {
    highlightElement.removeEventListener('mouseenter', onHighlightMouseEnterOrClick);
    highlightElement.removeEventListener('click', onHighlightMouseEnterOrClick);
    highlightElement.removeEventListener('mouseleave', onHighlightMouseLeave);
}

function getHoverToolEl() {
    if (!hoverToolEl.isConnected) {
        // The first time we want to show this element, append it to the DOM.
        // It's also possible the webpage deleted this node from the DOM. In that case, simply re-attach it
        hoverToolEl.appendTo('body');
    }

    return hoverToolEl;
}

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
    $(`.${HIGHLIGHT_CLASS}[data-highlight-id='${newHighlightId}']`).addClass('highlighter--hovered');
}

function onHighlightMouseLeave() {
    if (!highlightClicked) {
        hoverToolTimeout = setTimeout(hide, 170);
    }
}

function moveToolbarToHighlight(highlightEl, cursorX) { // cursorX is optional, in which case no change is made to the x position of the hover toolbar
    const boundingRect = highlightEl.getBoundingClientRect();
    const toolWidth = 108; // When changing this, also update the width in css #highlighter--hover-tools--container

    const hoverTop = boundingRect.top - 45;
    getHoverToolEl()?.css({ top: hoverTop });

    if (cursorX !== undefined) {
        let hoverLeft = null;
        if (boundingRect.width < toolWidth) {
            // center the toolbar if the highlight is smaller than the toolbar
            hoverLeft = boundingRect.left + (boundingRect.width / 2) - (toolWidth / 2);
        } else if (cursorX - boundingRect.left < toolWidth / 2) {
            // If the toolbar would overflow the highlight on the left, snap it to the left of the highlight
            hoverLeft = boundingRect.left;
        } else if (boundingRect.right - cursorX < toolWidth / 2) {
            // If the toolbar would overflow the highlight on the right, snap it to the right of the highlight
            hoverLeft = boundingRect.right - toolWidth;
        } else {
            // Else, center the toolbar above the cursor
            hoverLeft = cursorX - (toolWidth / 2);
        }

        getHoverToolEl()?.css({ left: hoverLeft });
    }

    getHoverToolEl()?.show();
}

function hide() {
    $('.highlighter--hovered').removeClass('highlighter--hovered');
    getHoverToolEl()?.hide();
    hoverToolTimeout = null;
    highlightClicked = false;
}

function onHoverToolMouseEnter() {
    if (hoverToolTimeout !== null) {
        clearTimeout(hoverToolTimeout);
        hoverToolTimeout = null;
    }
}

function onCopyBtnClicked() {
    const highlightId = currentHighlightEl.getAttribute('data-highlight-id');
    const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}[data-highlight-id='${highlightId}']`);
    const highlightText = Array.from(highlights).map((el) => el.textContent.replace(/\s+/ugm, ' ')).join(''); // clean up whitespace
    navigator.clipboard.writeText(highlightText);
    chrome.runtime.sendMessage({ action: 'track-event', trackCategory: 'highlight-action', trackAction: 'copy' });
}

function onDeleteBtnClicked() {
    const highlightId = currentHighlightEl.getAttribute('data-highlight-id');
    removeHighlight(highlightId);

    getHoverToolEl()?.hide();
    hoverToolTimeout = null;
    chrome.runtime.sendMessage({ action: 'track-event', trackCategory: 'highlight-action', trackAction: 'delete' });
}


// feature: change color on popup menu
function onChangeColorBtnClicked() {
    const highlightId = currentHighlightEl.getAttribute('data-highlight-id');
    updateHighlightColor(highlightId);
    chrome.runtime.sendMessage({ action: 'track-event', trackCategory: 'highlight-action', trackAction: 'change-color' });
}

export {
    initializeHoverTools,
    initializeHighlightEventListeners,
    onHighlightMouseEnterOrClick,
    removeHighlightEventListeners,
};
