/** @type {HTMLButtonElement} */
const downloadBackupBtn = document.getElementById("download-backup");
/** @type {HTMLButtonElement} */
const uploadBackupBtn = document.getElementById("upload-backup");
/** @type {HTMLButtonElement} */
const clearDataBtn = document.getElementById("clear-data");

/**
 * Downloads the local storage in a JSON file.
 */
async function downloadAllHighlights() {
  chrome.runtime.sendMessage({
    action: "track-event",
    trackCategory: "backup",
    trackAction: "download",
  });
  const highlights = await chrome.storage.local.get();
  const text = JSON.stringify(highlights, null, 2);
  const a = document.createElement("a");
  a.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  a.setAttribute("download", "Highlights Backup.json");
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Merges a JSON with the current contents of local storage.
 * @param {Record<string, any>} jsonData
 * @returns
 */
async function _mergeAndSaveUploadedData(jsonData) {
  const storedData = await chrome.storage.local.get();
  const highlights = storedData?.["highlights"]?.["highlights"];
  const jsonHighlights = jsonData?.["highlights"]?.["highlights"];
  if (!highlights) return await chrome.storage.local.set(jsonData);
  if (!jsonHighlights)
    throw new Error("Something went wrong with your backup data");
  for (const [key, value] of Object.entries(highlights)) {
    if (value) {
      for (const highlight of value) {
        const index = jsonHighlights[key].findIndex(
          (h) => h.uuid === highlight.uuid
        );
        if (index !== -1) jsonHighlights[key][index] = highlight;
        else jsonHighlights[key].push(highlight);
      }
    }
  }
  return await chrome.storage.local.set(jsonData);
}

async function _uploadAllHighlights(file) {
  chrome.runtime.sendMessage({
    action: "track-event",
    trackCategory: "backup",
    trackAction: "upload",
  });
  if (file) {
    const content = await file.text();
    try {
      const contentJson = JSON.parse(content);
      if (
        confirm(
          "Are you sure you want to upload this file? You may lose all your data."
        )
      ) {
        await _mergeAndSaveUploadedData(contentJson);
        alert("Your backup was loaded successfully.");
      }
    } catch (e) {
      console.error(e);
      alert(
        "There was an error loading the backup file. Are you sure it is the correct one?"
      );
    }
  }
}

/**
 * Utility object to map a Highlight object key to a validator function.
 */
const highlightsValidator = {
  anchorNode: (obj) => typeof obj["anchorNode"] === "string",
  anchorOffset: (obj) => typeof obj["anchorOffset"] === "number",
  color: (obj) => typeof obj["color"] === "string",
  container: (obj) => typeof obj["container"] === "string",
  focusNode: (obj) => typeof obj["focusNode"] === "string",
  focusOffset: (obj) => typeof obj["focusOffset"] === "number",
  href: (obj) => typeof obj["href"] === "string",
  string: (obj) => typeof obj["string"] === "string",
  version: (obj) => typeof obj["version"] === "string",
};

/**
 * Validates user uploaded files.
 * @param {File} file
 */
async function _validateFile(file) {
  if (file.type !== "application/json")
    throw new Error("This file is not valid");
  const content = await file.text();
  const json = JSON.parse(content);
  const highlightsContainer = json["highlights"];
  const uuid = json["uuid"];
  if (!highlightsContainer)
    throw new Error("There are no highlights in this file");
  if (typeof uuid !== "string") throw new Error("The schema is not valid");
  const highlights = highlightsContainer["highlights"];
  if (!highlights) throw new Error("There are no highlights in this file");
  const urls = Object.keys(highlights);
  if (urls.some((url) => typeof url !== "string"))
    throw new Error("There is something wrong with the provided schema");
  const urlsHighlights = Object.values(highlights);
  if (urlsHighlights.some((urlHighlights) => !Array.isArray(urlHighlights)))
    throw new Error("There is something wrong with the provided schema");
  const allHighlights = urlsHighlights.flat();
  if (
    !allHighlights.every((highlight) =>
      Object.values(highlightsValidator).every((fn) => fn(highlight))
    )
  )
    throw new Error("There is something wrong with the provided schema");
}

/**
 * Uploads a backup file and updates the local storage.
 */
function uploadFile() {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "application/json");
  input.addEventListener("change", async () => {
    let file = null;
    if (input.files.length) {
      file = input.files[0];
    }
    document.body.removeChild(input);
    try {
      await _validateFile(file);
    } catch (e) {
      alert(
        "There was something wrong uploading highlights, try another file."
      );
      return;
    }
    _uploadAllHighlights(file);
  });
  input.style.display = "none";
  document.body.appendChild(input);
  input.click();
}

/**
 * Clears the local storage
 */
async function clearData() {
  chrome.runtime.sendMessage({
    action: "track-event",
    trackCategory: "backup",
    trackAction: "clear",
  });
  if (
    confirm(
      "Are you sure you want to delete all your data? This action is not reversible."
    )
  ) {
    await chrome.storage.local.clear();
    alert("Your data was removed successfully.");
  }
}

downloadBackupBtn.addEventListener("click", downloadAllHighlights);
uploadBackupBtn.addEventListener("click", uploadFile);
clearDataBtn.addEventListener("click", clearData);
