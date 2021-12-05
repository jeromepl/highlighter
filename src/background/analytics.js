import { GA_TRACKING_ID } from '../../config/secrets.js';

function generateUUID() {
    return crypto.randomUUID();
}

async function clientUUID() {
    // Note that we don't use the 'sync' storage here as we want a separate ID
    // per device
    let { uuid } = await chrome.storage.local.get('uuid');
    if (uuid) return uuid;

    uuid = generateUUID();
    chrome.storage.local.set({ uuid });
    return uuid;
}

// https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
async function trackEvent(category, action, label = null, value = null, extraParams = {}) {
    const data = {
        // API Version.
        v: '1',
        // Tracking ID / Property ID.
        tid: GA_TRACKING_ID,
        // Anonymous Client Identifier.
        cid: await clientUUID(),
        // Event hit type.
        t: 'event',
        // Event category.
        ec: category,
        // Event action.
        ea: action,
        // Event label.
        ...(label && { el: label }),
        // Event value.
        ...(value && { ev: value }),
        ...extraParams,
    };

    const params = new URLSearchParams(data).toString();
    return fetch(`https://www.google-analytics.com/collect?${params}`);
}

export { trackEvent, clientUUID };
