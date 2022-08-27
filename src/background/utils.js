async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

export async function executeInCurrentTab(opts) {
    const tab = await getCurrentTab();
    return executeInTab(tab.id, opts);
}

export async function executeInTab(tabId, { file, func, args }) {
    const executions = await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        ...(file && { files: [file] }),
        func,
        args,
    });

    if (executions.length == 1) {
        return executions[0].result;
    }

    // If there are many frames, concatenate the results
    return executions.flatMap((execution) => execution.result);
}

export function wrapResponse(promise, sendResponse) {
    promise.then((response) => sendResponse({
        success: true,
        response,
    })).catch((error) => sendResponse({
        success: false,
        error: error.message,
    }));
}
