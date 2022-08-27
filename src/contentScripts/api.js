import getPageHighlights from './getPageHighlights.js';
import { toggleHighlighterCursor } from './highlighterCursor.js';
import highlightSelectedText from './highlightSelectedText.js';
import loadPageHighlights from "./loadPageHighlights.js";
import showHighlight from './showHighlight.js';
import { getLostHighlights, removeLostHighlight } from './utils/errorManager.js';
import { clearPage, removeHighlight } from './utils/storageManager.js';

export {
  clearPage,
  removeHighlight,
  showHighlight,
  toggleHighlighterCursor,
  getLostHighlights,
  removeLostHighlight,
  loadPageHighlights,
  highlightSelectedText,
  getPageHighlights,
};
