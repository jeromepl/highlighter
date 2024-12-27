// Use a dynamic import as a work-around to content scripts not supporting JS modules (ES6)
(async () => {
    const src = chrome.runtime.getURL('src/contentScripts/index.js');
    const contentScript = await import(src);
    contentScript.initialize();
})();

// FIXME: For testing only
// TODO: At the very least set externally_connectable to limit to testing domain only (whatever domain that would be...)
// https://stackoverflow.com/a/20716493
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    const methods = request.method.split(".");
    // Execute the method chain, passing the params only to the last method
    methods.reduce((acc, cur) => acc[cur], window.highlighterAPI)(...(request.params || []));
});
