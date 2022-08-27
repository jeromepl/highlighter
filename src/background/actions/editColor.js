import getColorOptions from './getColorOptions.js';

import { trackEvent } from '../analytics.js';

async function editColor(colorTitle, color, textColor) {
    trackEvent('color-edit', colorTitle);

    const colorOptions = await getColorOptions();
    const colorOption = colorOptions.find((option) => option.title === colorTitle);
    colorOption.color = color;
    colorOption.textColor = textColor;

    if (!textColor) {
        delete colorOption.textColor;
    }

    chrome.storage.sync.set({ colors: colorOptions });
}

export default editColor;
