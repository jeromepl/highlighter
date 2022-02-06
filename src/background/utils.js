async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function executeInCurrentTab({ file, func, args }) {
    const tab = await getCurrentTab();
    const executions = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
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

export { getCurrentTab, executeInCurrentTab };
