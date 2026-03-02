const PORT = process.env.PORT || 8080;
const DATA_FOLDER = process.env.DATA_FOLDER || 'data';

const MESSAGE_KEYS = {
  DRAWINGS: 'drawings',
  INDICATORS: 'indicators',
  APP_ACTION: 'app_action',
};

const ACTIONS = {
  SAVE: 'save',
  LOAD: 'load',
};

module.exports = { PORT, DATA_FOLDER, MESSAGE_KEYS, ACTIONS };