import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createReadingData,
  normalizeReadingToc,
  parseEnglishEntries,
  parseKoreanEntries,
  parseToc,
} from '../src/lib/parseThreeBodiesCore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

async function findFixture(prefix) {
  const entries = await readdir(projectRoot, { withFileTypes: true });
  const match = entries.find(
    (entry) => entry.isFile() && entry.name.startsWith(prefix) && entry.name.endsWith('.txt'),
  );

  if (!match) {
    throw new Error(`Cannot find fixture file with prefix: ${prefix}`);
  }

  return readFile(path.join(projectRoot, match.name), 'utf8');
}

async function main() {
  const [koreanSource, englishSource, tocSource] = await Promise.all([
    findFixture('1.'),
    findFixture('2.'),
    findFixture('3.'),
  ]);

  const snapshot = createReadingData(
    parseKoreanEntries(koreanSource),
    parseEnglishEntries(englishSource),
    normalizeReadingToc(parseToc(tocSource)),
  );

  const outputPath = path.join(projectRoot, 'public', 'reading-snapshot.json');
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, { encoding: 'utf8' });
  console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
