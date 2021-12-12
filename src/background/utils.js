const getCurrentTab = async () => {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

const executeInCurrentTab = async ({ file, func, args }) => {
    const tab = await getCurrentTab();
    const [execution] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        ...(file && { files: [file] }),
        func,
        args,
    });
    return execution.result;
}

export { getCurrentTab, executeInCurrentTab };
