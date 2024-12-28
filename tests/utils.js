// Utility method to select a the first occurence of a given piece of text in a page.
// NOTE: This currently only works if all the text is in the same DOM node.
export async function selectText(page, textToSelect) {
  await page.evaluate((text) => {
    function mergeRanges(range1, range2) {
      const newRange = document.createRange();
      const startRange = (range1.compareBoundaryPoints(Range.START_TO_START, range2) < 0) ? range1 : range2;
      const endRange = (range1.compareBoundaryPoints(Range.END_TO_END, range2) < 0) ? range2 : range1;
      newRange.setStart(startRange.startContainer, startRange.startOffset);
      newRange.setEnd(endRange.endContainer, endRange.endOffset);
      return newRange;
    }

    const selection = window.getSelection();
    const range = document.createRange();
    const textNode = document.evaluate(`//text()[contains(., '${text}')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (!textNode) {
      throw new Error(`Text not found: ${text}`);
    }
    const startIndex = textNode.data.indexOf(text);
    const endIndex = startIndex + text.length;
    range.setStart(textNode, startIndex);
    range.setEnd(textNode, endIndex);

    const mergedRange = selection.rangeCount > 0 ? mergeRanges(range, selection.getRangeAt(0)) : range;
    selection.removeAllRanges();
    selection.addRange(mergedRange);

    // Trigger a mouseup event to simulate the user releasing the mouse button after selecting
    selection.anchorNode.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  }, textToSelect);
}

export async function highlightText(page, popupPage, textToSelect) {
  await selectText(page, textToSelect);
  await page.bringToFront();
  await popupPage.evaluate(async () => {
    await chrome.runtime.sendMessage({ action: 'highlight' });
  });
}
