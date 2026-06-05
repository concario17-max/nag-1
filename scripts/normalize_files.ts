import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..');
const dataSourceDir = path.join(projectRoot, 'data-source');
const files = ['4.han bal.txt', '7.dan.txt', '1.sans.txt', '2.english.txt', '3.korean-1.txt', '5.bae_jik.txt', '6.bae_uu.txt'];

files.forEach(file => {
  const filePath = path.join(dataSourceDir, file);
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    // Remove BOM if exists
    let content = buffer.toString('utf-8');
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    // Normalize line endings and ensures simple UTF-8
    fs.writeFileSync(filePath, content.replace(/\r\n/g, '\n'), { encoding: 'utf-8' });
    console.log(`Normalized ${file}`);
  }
});
