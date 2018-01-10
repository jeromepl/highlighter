function store(selection, container, url, callback) {
    chrome.storage.local.get({highlights: {}}, (result) => {
        var highlights = result.highlights;

        if (!highlights[url])
            highlights[url] = [];

        highlights[url].push({
            string: selection.toString(),
            container: getQuery(container),
            anchorNode: getQuery(selection.anchorNode),
            anchorOffset: selection.anchorOffset,
            focusNode: getQuery(selection.focusNode),
            focusOffset: selection.focusOffset
        });
        chrome.storage.local.set({highlights});

        if (callback)
            callback();
    });
}

function load(url) {
    chrome.storage.local.get({highlights: {}}, function (result) {
        var highlights = result.highlights[url];
        for (var i = 0; highlights && i < highlights.length; i++) {

            var selection = {
                anchorNode: elementFromQuery(highlights[i].anchorNode),
                anchorOffset: highlights[i].anchorOffset,
                focusNode: elementFromQuery(highlights[i].focusNode),
                focusOffset: highlights[i].focusOffset
            };

            highlight(highlights[i].string, elementFromQuery(highlights[i].container), selection);
        }
    });
}

function clearPage(url) {
    chrome.storage.local.get({highlights: {}}, (result) => {
        var highlights = result.highlights;
        delete highlights[url];
        chrome.storage.local.set({highlights});
    });
}

function elementFromQuery(storedQuery) {
    var re = />textNode:nth-of-type\(([0-9]+)\)$/i;
    var result = re.exec(storedQuery);

    if (result) {
        var textNodeIndex = parseInt(result[1]);
        storedQuery = storedQuery.replace(re, "");
        var $parent = $(storedQuery);
        return $parent[0].childNodes[textNodeIndex];
    }
    else
        return $(storedQuery)[0];
}

// From an DOM element, get a query to that DOM element
function getQuery(element) {
    if (element.id)
        return '#' + element.id;
    if (element.localName === 'html')
        return 'html';

    var parent = element.parentNode;

    var index, parentSelector;
    // The element is a text node
    if (!element.localName) {
        // Find the index of the text node:
        index = Array.prototype.indexOf.call(parent.childNodes, element);

        parentSelector = getQuery(parent);
        return parentSelector + '>textNode:nth-of-type(' + index + ')';
    }
    else {
        var jEl = $(element);
        parentSelector = getQuery(parent);
        index = jEl.index(parentSelector + '>' + element.localName) + 1;
        return parentSelector + '>' + element.localName + ':nth-of-type(' + index + ')';
    }
}
