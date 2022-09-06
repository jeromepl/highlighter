import getColorOptions from './getColorOptions.js';

import { DEFAULT_COLOR_TITLE } from '../constants.js';

async function getCurrentColor() {
    const { color } = await chrome.storage.sync.get("color");
    const colorTitle = color || DEFAULT_COLOR_TITLE;
    const colorOptions = await getColorOptions();
    return colorOptions.find((colorOption) => colorOption.title === colorTitle) || colorOptions[0];
}

export default getCurrentColor;
