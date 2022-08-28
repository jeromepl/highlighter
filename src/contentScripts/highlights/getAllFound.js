// Return a Map of highlights found on the page,
// with the highlight id as the key and the highlight text as the value
function getAllFound() {
    const highlights = document.getElementsByClassName('highlighter--highlighted');

    return Array.from(highlights)
    .map((highlight) => [
        highlight.getAttribute('data-highlight-id'),
        highlight.textContent.replace(/\s+/ugm, ' ').trim(),
    ])
    .reduce((acc, [highlightId, highlightText]) => {
        if (acc.has(highlightId)) {
            acc.set(highlightId, `${acc.get(highlightId)} ${highlightText}`);
        } else {
            acc.set(highlightId, highlightText);
        }
        return acc;
    }, new Map()); // Use a Map instead of an object since it retains order of insertion
}

export default getAllFound;
