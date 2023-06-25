import { GA_MEASUREMENT_ID, GA_API_SECRET } from '../../config/secrets.js';

// Code slightly adapted from https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/tutorial.google-analytics/scripts/google-analytics.js

const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

const DEFAULT_ENGAGEMENT_TIME_MSEC = 100;
// Duration of inactivity after which a new session is created
const SESSION_EXPIRATION_IN_MIN = 30;

function generateUUID() {
  return crypto.randomUUID();
}

async function clientId() {
  // Note that we don't use the 'sync' storage here as we want a separate ID
  // per device
  let { uuid } = await chrome.storage.local.get('uuid');
  if (uuid) return uuid;

  uuid = generateUUID();
  chrome.storage.local.set({ uuid });
  return uuid;
}

async function sessionId() {
  // Use storage.session because it is only in memory
  let { sessionData } = await chrome.storage.session.get('sessionData');
  const currentTimeInMs = Date.now();
  // Check if session exists and is still valid
  if (sessionData && sessionData.timestamp) {
    // Calculate how long ago the session was last updated
    const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
    // Check if last update lays past the session expiration threshold
    if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
      // Clear old session id to start a new session
      sessionData = null;
    } else {
      // Update timestamp to keep session alive
      sessionData.timestamp = currentTimeInMs;
      await chrome.storage.session.set({ sessionData });
    }
  }
  if (!sessionData) {
    // Create and store a new session
    sessionData = {
      session_id: currentTimeInMs.toString(),
      timestamp: currentTimeInMs.toString(),
    };
    await chrome.storage.session.set({ sessionData });
  }
  return sessionData.session_id;
}

// Fires an event with optional params. Event names must only include letters and underscores.
async function trackEvent(name, action, label = null, value = null, extraParams = {}) {
  // Configure session id and engagement time if not present, for more details see:
  // https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag#recommended_parameters_for_reports
  if (!extraParams.session_id) {
    extraParams.session_id = await sessionId();
  }
  if (!extraParams.engagement_time_msec) {
    extraParams.engagement_time_msec = DEFAULT_ENGAGEMENT_TIME_MSEC;
  }

  try {
    await fetch(
      `${GA_ENDPOINT}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: await clientId(),
          events: [
            {
              name: name.replace("-", "_"),
              params: {
                action,
                ...(label && { label }),
                ...(value !== undefined && value !== null && { value }),
                ...extraParams,
              },
            },
          ],
        }),
      },
    );
  } catch (e) {
    console.error('Google Analytics request failed with an exception', e);
  }
}

export { trackEvent };
