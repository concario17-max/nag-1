const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const dataFilePath = path.join(projectRoot, 'data.js');
const mp3DirPath = path.join(projectRoot, 'public', 'mp3');

// 1. Read data.js and extract sutras array safely
const fileContent = fs.readFileSync(dataFilePath, 'utf8');
const prefix = 'const sutras = ';
const startIndex = fileContent.indexOf(prefix);
if (startIndex === -1) {
    console.error("Could not find const sutras = in data.js");
    process.exit(1);
}

const jsonString = fileContent.substring(startIndex + prefix.length).trim().replace(/;$/, '');
let sutras;
try {
    sutras = JSON.parse(jsonString);
} catch (e) {
    console.error("Failed to parse JSON from data.js", e.message);
    process.exit(1);
}

// 2. Read MP3 directory
let mp3Files = [];
try {
    mp3Files = fs.readdirSync(mp3DirPath).filter(f => f.endsWith('.mp3'));
} catch (e) {
    console.error("Failed to read mp3 directory", e.message);
    process.exit(1);
}

const mp3Names = new Set(mp3Files.map(f => f.replace('.mp3', '')));

// 3. Analyze
let missingMp3s = [];
let unmappedMp3s = new Set(mp3Names);
let checkResult = {
    chapterCounts: { '1': 0, '2': 0, '3': 0, '4': 0 },
    missingMp3s: missingMp3s,
};

sutras.forEach(s => {
    const chapterId = s.id.split('.')[0];
    checkResult.chapterCounts[chapterId]++;

    const expectedAudioName = s.id.replace('.', '-');
    if (!mp3Names.has(expectedAudioName)) {
        missingMp3s.push(s.id);
    } else {
        unmappedMp3s.delete(expectedAudioName);
    }
});

console.log("=== 전수 조사 결과 (Full Investigation Result) ===");
console.log("1. 수트라 개수 (data.js 기준):", checkResult.chapterCounts);
console.log("2. 총 MP3 파일 개수:", mp3Files.length);
console.log("3. 수트라는 있는데 매핑되는 MP3가 없는 경우:", missingMp3s.length > 0 ? missingMp3s : "없음");
console.log("4. MP3 파일은 있는데 매핑되는 수트라가 없는 경우:", Array.from(unmappedMp3s).length > 0 ? Array.from(unmappedMp3s) : "없음");

// Print texts of first few MP3s of Chapter 3 to check if text might be shifted
console.log("\n=== Chapter 3 텍스트 확인 (Data.js) ===");
const ch3Sutras = sutras.filter(s => s.id.startsWith('3.'));
console.log("3.1 Text (Korea 1):", ch3Sutras.find(s => s.id === '3.1')['3.korean-1']?.substring(0, 50));
console.log("3.2 Text (Korea 1):", ch3Sutras.find(s => s.id === '3.2')['3.korean-1']?.substring(0, 50));
console.log("3.3 Text (Korea 1):", ch3Sutras.find(s => s.id === '3.3')['3.korean-1']?.substring(0, 50));
console.log("3.55 Text (Korea 1):", ch3Sutras.find(s => s.id === '3.55')['3.korean-1']?.substring(0, 50));
if (ch3Sutras.find(s => s.id === '3.56')) {
    console.log("3.56 Text (Korea 1):", ch3Sutras.find(s => s.id === '3.56')['3.korean-1']?.substring(0, 50));
}
