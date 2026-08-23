/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const dirsToRemove = [
  path.join(__dirname, '..', '.next', 'cache'),
  path.join(__dirname, '..', '.netlify', '.next', 'cache')
];

dirsToRemove.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Removing cache directory: ${dir}`);
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`Successfully removed: ${dir}`);
    } catch (err) {
      console.error(`Error removing ${dir}:`, err);
    }
  } else {
    console.log(`Directory does not exist, skipping: ${dir}`);
  }
});
