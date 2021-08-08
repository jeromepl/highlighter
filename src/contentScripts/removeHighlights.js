"use strict";

(() => { // Restrict the scope of the variables to this file
    // Remove Highlights
    clearPage(window.location.hostname + window.location.pathname, window.location.pathname);
    // Force a reload here in order to get the DOM elements back in their original form
    // This is important since this whole thing depends on having reliable query strings
    window.location.reload();
})();
