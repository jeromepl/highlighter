import { addHighlightError } from './errorManager.js';

import { highlight } from '../highlight/index.js';

const STORE_FORMAT_VERSION = chrome.runtime.getManifest().version;

let alternativeUrlIndexOffset = 0; // Number of elements stored in the alternativeUrl Key. Used to map highlight indices to correct key

async function getCookie(){
    const res = await chrome.runtime.sendMessage({ action:  'get-auth'});
    if(res.response){
        return res.response;
    }
    else{
        chrome.tabs.create({ url: 'https://jots.co/sign_in', active: false });
    }
}

async function loadClippings(url) {
    const cookie = await getCookie();

    if(!cookie){
        return
    }

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    };

    const res = await fetch(`https://jots.co/api/clippings?link=${"https://" + url}&title=${"https://" + url}&jots_session=${cookie}`, { headers });

    const data = await res.json();
    return data.clippings;
}


async function createClipping(text, link, title, clipping_data) {
    console.log("create clipping - clipping_data", clipping_data);
    const cookie = await getCookie();

    if(!cookie) return;

    const res = await fetch(`https://jots.co/api/clippings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: clipping_data,
            text: text,
            title: document.title,
            link: clipping_data.href,
            jots_session: decodeURIComponent(cookie)
        })
    });

    if(res.status === 200){
        const data = await res.json();
        // okay - TODO
        const formatted = data.clippings.map(x => x.data);
        console.log("okay, here we have data", formatted);
        return formatted;
    }

}

// url is no longer use as each page's clippings are returned independently by title and href
async function store(selection, container, url, href, color, textColor) {
    const clipping = {
        version: STORE_FORMAT_VERSION,
        string: selection.toString(),
        container: getQuery(container),
        anchorNode: getQuery(selection.anchorNode),
        anchorOffset: selection.anchorOffset,
        focusNode: getQuery(selection.focusNode),
        focusOffset: selection.focusOffset,
        color,
        textColor,
        href,
        uuid: crypto.randomUUID(),
        createdAt: Date.now(),
    };
    
    const clippings = await createClipping(clipping.string, clipping.href, clipping.href, clipping);

    // Return the index of the new highlight:
    if(clippings){
        return clippings.length - 1;
    }

}

async function update(highlightIndex, url, alternativeUrl, newColor, newTextColor) {
    const { highlights } = await chrome.storage.local.get({ highlights: {} });

    let urlToUse = url;
    let indexToUse = highlightIndex - alternativeUrlIndexOffset;
    if (highlightIndex < alternativeUrlIndexOffset) {
        urlToUse = alternativeUrl;
        indexToUse = highlightIndex;
    }

    const highlightsInKey = highlights[urlToUse];
    if (highlightsInKey) {
        const highlightObject = highlightsInKey[indexToUse];
        if (highlightObject) {
            highlightObject.color = newColor;
            highlightObject.textColor = newTextColor;
            highlightObject.updatedAt = Date.now();
            chrome.storage.local.set({ highlights });
        }
    }
}

// alternativeUrl is no longer used, second parameter is optional
async function loadAll(url, alternativeUrl) {
    const highlights = await loadClippings(url);

    if (!highlights) return;

    for (let i = 0; i < highlights.length; i++) {
        load(highlights[i].data, i);
    }
}

// noErrorTracking is optional
function load(highlightVal, highlightIndex, noErrorTracking) {
    const selection = {
        anchorNode: elementFromQuery(highlightVal.anchorNode),
        anchorOffset: highlightVal.anchorOffset,
        focusNode: elementFromQuery(highlightVal.focusNode),
        focusOffset: highlightVal.focusOffset,
    };

    const { color, string: selectionString, textColor, version } = highlightVal;
    const container = elementFromQuery(highlightVal.container);

    if (!selection.anchorNode || !selection.focusNode || !container) {
        if (!noErrorTracking) {
            addHighlightError(highlightVal, highlightIndex);
        }
        return false;
    }

    const success = highlight(selectionString, container, selection, color, textColor, highlightIndex, version);

    if (!noErrorTracking && !success) {
        addHighlightError(highlightVal, highlightIndex);
    }
    return success;
}

async function removeHighlight(highlightIndex, url, alternativeUrl) {
    const { highlights } = await chrome.storage.local.get({ highlights: {} });

    if (highlightIndex < alternativeUrlIndexOffset) {
        highlights[alternativeUrl].splice(highlightIndex, 1);
    } else {
        highlights[url].splice(highlightIndex - alternativeUrlIndexOffset, 1);
    }

    chrome.storage.local.set({ highlights });
}

// alternativeUrl is optional
async function clearPage(url, alternativeUrl) {
    const { highlights } = await chrome.storage.local.get({ highlights: {} });

    delete highlights[url];
    if (alternativeUrl) {
        // See 'loadAll()' for an explaination of why this is necessary
        delete highlights[alternativeUrl];
    }

    chrome.storage.local.set({ highlights });
}

function elementFromQuery(storedQuery) {
    const re = />textNode:nth-of-type\(([0-9]+)\)$/ui;
    const result = re.exec(storedQuery);

    if (result) { // For text nodes, nth-of-type needs to be handled differently (not a valid CSS selector)
        const textNodeIndex = parseInt(result[1], 10);
        storedQuery = storedQuery.replace(re, "");
        const parent = robustQuerySelector(storedQuery);

        if (!parent) return undefined;

        return parent.childNodes[textNodeIndex];
    }

    return robustQuerySelector(storedQuery);
}

function robustQuerySelector(query) {
    try {
        return document.querySelector(query);
    } catch (error) {
        // It is possible that this query fails because of an invalid CSS selector that actually exists in the DOM.
        // This was happening for example here: https://lawphil.net/judjuris/juri2013/sep2013/gr_179987_2013.html
        // where there is a tag <p"> that is invalid in HTML5 but was still rendered by the browser
        // In this case, manually find the element:
        let element = document;
        for (const queryPart of query.split(">")) {
            if (!element) return null;

            const re = /^(.*):nth-of-type\(([0-9]+)\)$/ui;
            const result = re.exec(queryPart);
            const [, tagName, index] = result || [undefined, queryPart, 1];
            element = Array.from(element.childNodes).filter((child) => child.localName === tagName)[index - 1];
        }
        return element;
    }
}

// From an DOM element, get a query to that DOM element
function getQuery(element) {
    if (element.id) return `#${escapeCSSString(element.id)}`;
    if (element.localName === 'html') return 'html';

    const parent = element.parentNode;

    const parentSelector = getQuery(parent);
    // The element is a text node
    if (!element.localName) {
        // Find the index of the text node:
        const index = Array.prototype.indexOf.call(parent.childNodes, element);
        return `${parentSelector}>textNode:nth-of-type(${index})`;
    } else {
        const index = Array.from(parent.childNodes).filter((child) => child.localName === element.localName).indexOf(element) + 1;
        return `${parentSelector}>${element.localName}:nth-of-type(${index})`;
    }
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString) {
    return cssString.replace(/(:)/ug, "\\$1");
}

export {
    store,
    update,
    loadAll,
    load,
    removeHighlight,
    clearPage,
};
