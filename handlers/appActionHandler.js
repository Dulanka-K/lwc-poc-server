const { WebSocket } = require('ws');

const handle = async (wss, senderWs, message) => {
  const { action } = message;
  console.log(`Broadcasting app action: ${action}`);

  wss.clients.forEach((client) => {
    // Send to all clients except the sender (the simulator)
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

module.exports = { handle };
