const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Event listener for incoming messages
  ws.on('message', async (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage);
      const { key, action, data, requestId } = message;

      console.log(`Received action: ${action} for key: ${key}`);

      const filePath = path.join(DATA_DIR, `${key}.json`);

      if (action === 'save') {
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`Saved ${key} successfully`);
        
        // 'save' is usually fire-and-forget, so we don't strictly need to reply,
        // but we could send an ack here if desired.
      } else if (action === 'load') {
        let loadedData = null;
        try {
          const fileContent = await fs.promises.readFile(filePath, 'utf-8');
          loadedData = JSON.parse(fileContent);
        } catch (err) {
          // If file doesn't exist (first run), return null/empty
          if (err.code !== 'ENOENT') {
            console.error(`Error reading ${key}:`, err);
          }
        }

        const response = JSON.stringify({
          request: { requestId },
          data: loadedData
        });

        ws.send(response);
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
