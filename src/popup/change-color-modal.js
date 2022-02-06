import { getFromBackgroundPage, hexToRgb, rgbToHex } from "./utils.js";

const form = document.getElementById('change-color-form');
const cancelButton = document.getElementById('change-color-cancel');
const useTextColorCheckbox = document.querySelector('#change-color-form input[name="use-text-color"]');
const highlightColorField = document.querySelector('#change-color-form input[name="highlight-color"]');
const textColorField = document.querySelector('#change-color-form input[name="text-color"]');
const textColorFieldSet = document.getElementById('text-color-fieldset');
const colorTitleElement = document.getElementById('change-color-title');
const modal = document.getElementById('change-color-modal');

async function open() {
    const colorOption = await getFromBackgroundPage({ action: 'get-current-color' });
    const { title, color, textColor } = colorOption;

    colorTitleElement.innerText = title;
    textColorFieldSet.disabled = !textColor;
    useTextColorCheckbox.checked = Boolean(textColor);
    highlightColorField.value = rgbToHex(color);
    textColorField.value = rgbToHex(textColor) || "#000000";

    modal.style.display = 'flex';
}

function close() {
    modal.style.display = 'none';
}

// Toggle the disabled state of the text-color input
function onUseTextColorValueChanged(e) {
    textColorFieldSet.disabled = !e.target.checked;
}

function confirm(e) {
    e.preventDefault();

    const data = new FormData(e.target);
    const colorTitle = colorTitleElement.innerText;
    const color = hexToRgb(data.get('highlight-color'));
    const textColor = hexToRgb(data.get('text-color'));

    chrome.runtime.sendMessage({ action: 'edit-color', colorTitle, color, textColor });
    location.reload(); // Force a refresh of the colors list in the popup
}

// Remove All and its confirmation modal:
form.addEventListener('submit', confirm);
cancelButton.addEventListener('click', close);
useTextColorCheckbox.addEventListener('change', onUseTextColorValueChanged);

close(); // Trigger initially to hide the 'remove confirmation' section

export { open, close };
