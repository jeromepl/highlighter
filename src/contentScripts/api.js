import * as highlight from './highlight/index.js';
import { toggleHighlighterCursor } from './highlighterCursor/index.js';
import * as highlights from './highlights/index.js';

const highlighterCursor = {
  toggle: toggleHighlighterCursor,
};

export {
  highlighterCursor,
  highlights,
  highlight,
};
