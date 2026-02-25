const fs = require('fs');
const path = require('path');

// Resolves to d:\Other\lwc-poc-server\data
const DATA_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const save = async (key, data) => {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
};

const load = async (key) => {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (err) {
    // If file doesn't exist (first run), return null
    if (err.code !== 'ENOENT') {
      console.error(`Error reading ${key}:`, err);
    }
    return null;
  }
};

module.exports = { save, load };
