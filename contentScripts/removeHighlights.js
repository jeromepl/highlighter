"use strict";

// Remove Highlights
$('.highlighter--highlighted').contents().unwrap();
clearPage(window.location.hostname + window.location.pathname, window.location.pathname);
