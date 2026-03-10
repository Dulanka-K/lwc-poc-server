const PORT = process.env.PORT || 8080;
const DATA_FOLDER = process.env.DATA_FOLDER || 'data';

const MESSAGE_KEYS = {
  DRAWINGS: 'drawings',
  INDICATORS: 'indicators',
  APP_ACTION: 'app_action',
  DATA_PROVIDER: 'data_provider',
};

const ACTIONS = {
  SAVE: 'save',
  LOAD: 'load',
  GET_HISTORY: 'get_history',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
};

module.exports = { PORT, DATA_FOLDER, MESSAGE_KEYS, ACTIONS };