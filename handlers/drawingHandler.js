const storageService = require('../services/storageService');
const { ACTIONS } = require('../constants');

const handle = async (ws, message) => {
  const { action, key, data, requestId } = message;

  switch (action) {
    case ACTIONS.SAVE:
      await storageService.save(key, data);
      console.log(`Saved drawings successfully`);
      break;

    case ACTIONS.LOAD:
      const loadedData = await storageService.load(key);
      const response = JSON.stringify({
        request: { requestId },
        data: loadedData
      });
      ws.send(response);
      break;

    default:
      console.warn(`Unknown action for drawing: ${action}`);
  }
};

module.exports = { handle };
