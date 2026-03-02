require('dotenv').config();
const { WebSocketServer } = require('ws');
const indicatorHandler = require('./handlers/indicatorHandler');
const drawingHandler = require('./handlers/drawingHandler');
const appActionHandler = require('./handlers/appActionHandler');
const { PORT, MESSAGE_KEYS } = require('./constants');

const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage);
      const { key, action } = message;

      console.log(`Received action: ${action} for key: ${key}`);

      switch (key) {
        case MESSAGE_KEYS.DRAWINGS:
          await drawingHandler.handle(ws, message);
          break;
        case MESSAGE_KEYS.INDICATORS:
          await indicatorHandler.handle(ws, message);
          break;
        case MESSAGE_KEYS.APP_ACTION:
          await appActionHandler.handle(wss, ws, message);
          break;
        default:
          console.warn(`Unknown key: ${key}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Event listener for client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Event listener for errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});
