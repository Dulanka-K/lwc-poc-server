const { WebSocketServer } = require('ws');
const indicatorHandler = require('./handlers/indicatorHandler');
const drawingHandler = require('./handlers/drawingHandler');
const appActionHandler = require('./handlers/appActionHandler');

const PORT = 8080;

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
        case 'drawings':
          await drawingHandler.handle(ws, message);
          break;
        case 'indicators':
          await indicatorHandler.handle(ws, message);
          break;
        case 'app_action':
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
