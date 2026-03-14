require('dotenv').config();
const os = require('os');
const { WebSocketServer } = require('ws');
const indicatorHandler = require('./handlers/indicatorHandler');
const drawingHandler = require('./handlers/drawingHandler');
const appActionHandler = require('./handlers/appActionHandler');
const dataHandler = require('./handlers/dataHandler');
const { PORT, MESSAGE_KEYS } = require('./constants');

const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if ('IPv4' !== iface.family || iface.internal) {
        continue;
      }
      return iface.address;
    }
  }
  return null;
};

const wss = new WebSocketServer({ port: PORT });
const localIp = getLocalIpAddress();

console.log(`WebSocket server is running!`);
console.log(`- Local:   ws://localhost:${PORT}`);
if (localIp) console.log(`- Network: ws://${localIp}:${PORT}`);

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
        case MESSAGE_KEYS.DATA_PROVIDER:
          dataHandler.handle(ws, message);
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
    dataHandler.cleanup(ws);
  });

  // Event listener for errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});
