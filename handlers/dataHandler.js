const { ACTIONS } = require('../constants');

const generateCandle = (lastClose, time, currentCandle = null) => {
  // If we are in the same minute, update the existing candle
  if (currentCandle && currentCandle.time === time) {
    const volatility = 2; // Smaller volatility for ticks
    const change = (Math.random() - 0.5) * volatility;
    const newClose = currentCandle.close + change;

    return {
      ...currentCandle,
      high: Math.round(Math.max(currentCandle.high, newClose) * 100) / 100,
      low: Math.round(Math.min(currentCandle.low, newClose) * 100) / 100,
      close: Math.round(newClose * 100) / 100,
      customValues: {
        volume: (currentCandle.customValues?.volume || 0) + Math.floor(Math.random() * 100),
      },
    };
  }

  // Otherwise, generate a new candle
  const volatility = 10;
  const open = lastClose;
  const change = (Math.random() - 0.5) * volatility * 2;
  const close = open + change;
  const high = Math.max(open, close) + Math.random() * volatility * 0.5;
  const low = Math.min(open, close) - Math.random() * volatility * 0.5;

  return {
    time,
    open: Math.round(open * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    close: Math.round(close * 100) / 100,
    customValues: {
      volume: Math.floor(1000 + Math.random() * 9000),
    },
  };
};

const handle = (ws, message) => {
  const { action, data, requestId } = message;

  switch (action) {
    case ACTIONS.GET_HISTORY: {
      console.log(`Generating history for ${data.symbol}`);
      const limit = 1000;
      const history = [];
      // Start 1000 minutes ago
      let time = Math.floor(Date.now() / 1000 / 60) * 60 - (limit * 60);
      let lastClose = 10000;

      for (let i = 0; i < limit; i++) {
        const candle = generateCandle(lastClose, time);
        history.push(candle);
        lastClose = candle.close;
        time += 60;
      }

      // Store last close for this client to ensure continuity when subscription starts
      ws.lastClose = lastClose;

      ws.send(JSON.stringify({
        request: { requestId },
        data: history
      }));
      break;
    }

    case ACTIONS.SUBSCRIBE: {
      console.log(`Subscribing to ${data.symbol}`);
      // Clear existing subscription if any
      if (ws.subscriptionInterval) {
        clearInterval(ws.subscriptionInterval);
      }

      ws.currentCandle = null;

      ws.subscriptionInterval = setInterval(() => {
        const time = Math.floor(Date.now() / 1000 / 60) * 60;
        const basePrice = ws.currentCandle ? ws.currentCandle.close : (ws.lastClose || 10000);
        const candle = generateCandle(basePrice, time, ws.currentCandle);
        
        ws.currentCandle = candle;
        ws.lastClose = candle.close;

        ws.send(JSON.stringify({
          key: 'market_update',
          data: candle
        }));
      }, 1000);
      break;
    }

    case ACTIONS.UNSUBSCRIBE: {
      console.log(`Unsubscribing from ${data?.symbol}`);
      cleanup(ws);
      break;
    }
  }
};

const cleanup = (ws) => {
  if (ws.subscriptionInterval) {
    clearInterval(ws.subscriptionInterval);
    ws.subscriptionInterval = null;
  }
};

module.exports = { handle, cleanup };