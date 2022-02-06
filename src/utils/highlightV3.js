"use strict";

(() => {
    window.highlightV3 = function (selString, container, selection, color, textColor, highlightIndex) { /* eslint-disable-line no-redeclare, no-unused-vars */

        const highlightInfo = {
            color: color ? color : "yellow",
            textColor: textColor ? textColor : "inherit",
            highlightIndex: highlightIndex,
            selectionString: selString,
            selectionLength: selString.length,
            container: $(container),
            anchor: $(selection.anchorNode),
            anchorOffset: selection.anchorOffset,
            focus: $(selection.focusNode),
            focusOffset: selection.focusOffset,
        };

        /**
        * STEPS:
        * 1 - Use the offset of the anchor/focus to find the start of the selected text in the anchor/focus element
        *     - Use the first of the anchor of the focus elements to appear
        * 2 - From there, go through the elements and find all Text Nodes until the selected text is all found.
        *     - Wrap all the text nodes (or parts of them) in a span DOM element with special highlight class name and bg color
        * 3 - Deselect text
        * 4 - Attach mouse hover event listeners to display tools when hovering a highlight
        */

        // Step 1 + 2:
        recursiveWrapper(highlightInfo);

        // Step 3:
        if (selection.removeAllRanges) selection.removeAllRanges();

        // Step 4:
        const parent = $(container).parent();
        parent.find(`.${HIGHLIGHT_CLASS}`).each((i, el) => {
            el.addEventListener('mouseenter', onHighlightMouseEnterOrClick);
            el.addEventListener('click', onHighlightMouseEnterOrClick);
            el.addEventListener('mouseleave', onHighlightMouseLeave);
        });

        return true; // No errors. 'undefined' is returned by default if any error occurs during this method's execution, like if 'content.replace' fails by 'content' being 'undefined'
    };

    function recursiveWrapper(highlightInfo) {
        return _recursiveWrapper(highlightInfo, false, 0); // Initialize the values of 'startFound' and 'charsHighlighted'
    }

    function _recursiveWrapper(highlightInfo, startFound, charsHighlighted) {

        const { container, anchor, focus, anchorOffset, focusOffset, color, textColor, highlightIndex, selectionString, selectionLength } = highlightInfo;

        container.contents().each((index, element) => {
            if (charsHighlighted >= selectionLength) return; // Stop early if we are done highlighting

            if (element.nodeType === Node.TEXT_NODE) {
                let startIndex = 0;

                // Step 1:
                // The first element to appear could be the anchor OR the focus node,
                // since you can highlight from left to right or right to left
                if (!startFound) {
                    if (anchor.is(element)) {
                        startFound = true;
                        startIndex = anchorOffset;
                    }
                    if (focus.is(element)) {
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
                    const nodeValue = element.nodeValue;
                    const nodeValueLength = element.nodeValue.length;
                    const parent = element.parentElement;

                    let firstSplitTextEl = null;
                    let firstSplitIndex = -1;
                    let secondSplitTextEl = null;

                    // Go over all characters to see if they match the selection.
                    // This is done because the selection text and node text contents differ.
                    for (let i = 0; i < nodeValueLength; i++) {
                        if (i === startIndex) {
                            firstSplitTextEl = element.splitText(i);
                            firstSplitIndex = i;
                        }
                        if (charsHighlighted === selectionLength) {
                            secondSplitTextEl = firstSplitTextEl.splitText(i - firstSplitIndex);
                            break;
                        }

                        if (i >= startIndex && charsHighlighted < selectionLength) {
                            // Skip whitespaces as they often cause trouble (differences between selection and actual text)
                            while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/u)) {
                                charsHighlighted++;
                            }

                            if (selectionString[charsHighlighted] === nodeValue[i]) {
                                charsHighlighted++;
                            }
                        }
                    }

                    // If textElement is wrapped in a .highlighter--highlighted span, do not add this highlight
                    if (parent.classList.contains(HIGHLIGHT_CLASS)) {
                        parent.normalize(); // Undo any 'splitText' operations
                        return;
                    }

                    if (firstSplitTextEl) {
                        const highlightNode = document.createElement('span');
                        highlightNode.classList.add((color === 'inherit') ? DELETED_CLASS : HIGHLIGHT_CLASS);
                        highlightNode.style.backgroundColor = color;
                        highlightNode.style.color = textColor;
                        highlightNode.dataset.highlightId = highlightIndex;
                        highlightNode.textContent = firstSplitTextEl.nodeValue;

                        firstSplitTextEl.remove();
                        const insertBeforeElement = secondSplitTextEl || element.nextSibling;
                        parent.insertBefore(highlightNode, insertBeforeElement);
                    }
                }
            } else {
                highlightInfo.container = $(element);
                [startFound, charsHighlighted] = _recursiveWrapper(highlightInfo, startFound, charsHighlighted);
            }
        });

        return [startFound, charsHighlighted];
    }
})();
