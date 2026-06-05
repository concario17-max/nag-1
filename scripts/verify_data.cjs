const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(projectRoot, 'public', 'data.json'), 'utf8'));
const targetIds = Array.from({length: 15}, (_, i) => `3.${i + 22}`);
const result = data.filter(item => targetIds.includes(item.id));

console.log(JSON.stringify(result, null, 2));
