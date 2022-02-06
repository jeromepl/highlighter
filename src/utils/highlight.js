"use strict";

(() => {
    window.HIGHLIGHT_CLASS = 'highlighter--highlighted';
    window.DELETED_CLASS = 'highlighter--deleted';

    // Highlight method that selects the right highlighting algorithm based on the version the highlight was stored in
    // We keep old algorithms for backwards compatibility of old saved highlights
    window.highlight = function (selectionString, container, selection, color, textColor, highlightIndex, version = null) {
        if (version === null || versionCompare(version, "4.0.0") >= 0) {
            // Starting with version 4, the highlighting algorithm is more strict to prevent highlighting all the page and a big refactor was done
            return highlightV4(selectionString, container, selection, color, textColor, highlightIndex);
        } else if (versionCompare(version, "3.1.0") >= 0) {
            // Starting with version 3.1.0, a new highlighting system was used which modifies the DOM in place
            return highlightV3(selectionString, container, selection, color, textColor, highlightIndex);
        } else {
            return highlight_legacy(selectionString, container, selection, color, highlightIndex);
        }
    };

    // Compare two manifest version strings, e.g. "3.1.0" > "2.0.4"
    // Returns 1 if v1 is greater than v2, -1 if smaller and 0 if equal
    // Counts an 'undefined' version as if it was the smallest possible
    function versionCompare(v1, v2) {
        if (v1 === undefined && v2 === undefined) return 0;
        if (v1 === undefined) return -1;
        if (v2 === undefined) return 1;

        const v1Numbers = v1.split('.').map((numStr) => parseInt(numStr, 10));
        const v2Numbers = v2.split('.').map((numStr) => parseInt(numStr, 10));

        const v1Len = v1Numbers.length, v2Len = v2Numbers.length;

        for (let i = 0; i < Math.min(v1Len, v2Len); i++) {
            if (v1Numbers[i] !== v2Numbers[i]) {
                return (v1Numbers[i] > v2Numbers[i]) ? 1 : -1;
            }
        }

        // If all numbers matched but one string has more numbers then it is newer
        if (v1Len !== v2Len) return (v1Len > v2Len) ? 1 : -1;

        return 0; // Everything is equal
    }
})();
