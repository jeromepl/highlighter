import { executeInCurrentTab } from '../utils.js';

function getHighlights() {
    return executeInCurrentTab({ file: 'src/contentScripts/getHighlights.js' });
}

export default getHighlights;
