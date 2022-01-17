const confirmButton = document.getElementById('remove-all-confirm');
const cancelButton = document.getElementById('remove-all-cancel');
const modal = document.getElementById('remove-all-confirmation-modal');

function open() {
    // Ask confirmation to remove all highlights on the page
    modal.style.display = 'flex';
}

function close() {
    modal.style.display = 'none';
}

function confirm() {
    // Closing the window here also allows automatic refreshing of the highlight list
    chrome.runtime.sendMessage({ action: 'remove-highlights' }, () => window.close());
}

// Remove All and its confirmation modal:
confirmButton.addEventListener('click', confirm);
cancelButton.addEventListener('click', close);

close(); // Trigger initially to hide the 'remove confirmation' section

export { open, close };
