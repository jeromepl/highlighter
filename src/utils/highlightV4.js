"use strict";

(() => {
    window.highlightV4 = function (selString, container, selection, color, textColor, highlightIndex) { /* eslint-disable-line no-redeclare, no-unused-vars */
        const highlightInfo = {
            color: color ? color : "yellow",
            textColor: textColor ? textColor : "inherit",
            highlightIndex: highlightIndex,
            selectionString: selString,
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
        try {
            recursiveWrapper($(container), highlightInfo);
        } catch (e) {
            return false;
        }

        // Step 3:
        if (selection.removeAllRanges) selection.removeAllRanges();

        // Step 4:
        const parent = $(container).parent();
        parent.find(`.${HIGHLIGHT_CLASS}`).each((_i, el) => {
            el.addEventListener('mouseenter', onHighlightMouseEnterOrClick);
            el.addEventListener('click', onHighlightMouseEnterOrClick);
            el.addEventListener('mouseleave', onHighlightMouseLeave);
        });

        return true; // No errors
    };

    function recursiveWrapper(container, highlightInfo) {
        return _recursiveWrapper(container, highlightInfo, false, 0); // Initialize the values of 'startFound' and 'charsHighlighted'
    }

    function _recursiveWrapper(container, highlightInfo, startFound, charsHighlighted) {
        const { anchor, focus, anchorOffset, focusOffset, color, textColor, highlightIndex, selectionString } = highlightInfo;
        const selectionLength = selectionString.length;

        container.contents().each((_index, element) => {
            if (charsHighlighted >= selectionLength) return; // Stop early if we are done highlighting

            if (element.nodeType !== Node.TEXT_NODE) {
                // Only look at visible nodes because invisible nodes aren't included in the selected text
                // from the Window.getSelection() API
                const jqElement = $(element);
                if (jqElement.is(':visible') && getComputedStyle(element).visibility !== 'hidden') {
                    [startFound, charsHighlighted] = _recursiveWrapper(jqElement, highlightInfo, startFound, charsHighlighted);
                }
                return;
            }

            // Step 1:
            // The first element to appear could be the anchor OR the focus node,
            // since you can highlight from left to right or right to left
            let startIndex = 0;
            if (!startFound) {
                if (!anchor.is(element) && !focus.is(element)) return; // If the element is not the anchor or focus, continue

                startFound = true;
                startIndex = Math.min(...[
                    ...(anchor.is(element) ? [anchorOffset] : []),
                    ...(focus.is(element) ? [focusOffset] : []),
                ]);
            }

            // Step 2:
            // If we get here, we are in a text node, the start was found and we are not done highlighting
            const { nodeValue, parentElement: parent } = element;

            if (startIndex > nodeValue.length) {
                // Start index is beyond the length of the text node, can't find the highlight
                // NOTE: we allow the start index to be equal to the length of the text node here just in case
                throw new Error(`No match found for highlight string '${selectionString}'`);
            }

            // Split the text content into three parts, the part before the highlight, the highlight and the part after the highlight:
            const highlightTextEl = element.splitText(startIndex);

            // Instead of simply blindly highlighting the text by counting characters,
            // we check if the text is the same as the selection string.
            let i = startIndex;
            for (; i < nodeValue.length; i++) {
                // Skip any whitespace characters in the selection string as there can
                // be more than in the text node:
                while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/u)) charsHighlighted++;

                if (charsHighlighted >= selectionLength) break;

                const char = nodeValue[i];
                if (char === selectionString[charsHighlighted]) {
                    charsHighlighted++;
                } else if (!char.match(/\s/u)) { // FIXME: Here, this is where the issue happens
                    // Similarly, if the char in the text node is a whitespace, ignore any differences
                    // Otherwise, we can't find the highlight text; throw an error
                    throw new Error(`No match found for highlight string '${selectionString}'`);
                }
            }

            // If textElement is wrapped in a .highlighter--highlighted span, do not add this highlight
            // as it is already highlighted, but still count the number of charsHighlighted
            if (parent.classList.contains(HIGHLIGHT_CLASS)) return;

            const elementCharCount = i - startIndex; // Number of chars to highlight in this particular element
            const insertBeforeElement = highlightTextEl.splitText(elementCharCount);
            const highlightText = highlightTextEl.nodeValue;

            // If the text is all whitespace, ignore it
            if (highlightText.match(/^\s*$/u)) {
                parent.normalize(); // Undo any 'splitText' operations
                return;
            }

            // If we get here, highlight!
            // Wrap the highlighted text in a span with the highlight class name
            const highlightNode = document.createElement('span');
            highlightNode.classList.add((color === 'inherit') ? DELETED_CLASS : HIGHLIGHT_CLASS);
            highlightNode.style.backgroundColor = color;
            highlightNode.style.color = textColor;
            highlightNode.dataset.highlightId = highlightIndex;
            highlightNode.textContent = highlightTextEl.nodeValue;
            highlightTextEl.remove();
            parent.insertBefore(highlightNode, insertBeforeElement);
        });

        return [startFound, charsHighlighted];
    }
})();
