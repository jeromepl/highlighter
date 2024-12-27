// Utility method to select a the first occurence of a given piece of text in a page.
// NOTE: This currently only works if all the text is in the same DOM node.
export async function selectText(page, textToSelect) {
  await page.evaluate((text) => {
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
    selection.removeAllRanges();
    selection.addRange(range);
  }, textToSelect);
}