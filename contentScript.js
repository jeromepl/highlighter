// Use a dynamic import as a work-around to content scripts not supporting JS modules (ES6)
(async () => {
    const src = chrome.runtime.getURL('src/contentScripts/index.js');
    const contentScript = await import(src);
    contentScript.initialize();
})();
