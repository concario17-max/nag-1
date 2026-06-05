const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const dataSourceDir = path.join(projectRoot, 'data-source');
const dataFilePath = path.join(projectRoot, 'data.js');
const danFilePath = path.join(dataSourceDir, '7.dan.txt');
const sansFilePath = path.join(dataSourceDir, '1.sans.txt');

function parseDanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const data = {};
    let currentId = null;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Check for ID (e.g., 1-1, 1-2, 2-23, etc.)
        // Regex to match "Chapter-Sutra" pattern at the start of the line alone
        if (/^\d+-\d+$/.test(trimmedLine)) {
            currentId = trimmedLine.replace('-', '.'); // Convert 1-1 to 1.1 to match data.js
            data[currentId] = {};
        } else if (currentId) {
            // Parse word meaning
            // Format: word meaning...
            // Split by first space
            const firstSpaceIndex = trimmedLine.indexOf(' ');
            if (firstSpaceIndex !== -1) {
                const word = trimmedLine.substring(0, firstSpaceIndex).trim();
                const meaning = trimmedLine.substring(firstSpaceIndex + 1).trim();
                if (word && meaning) {
                    data[currentId][word] = meaning;
                }
            }
        }
    });
    return data;
}

function parseSansFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const data = {};
    let currentId = null;
    let foundSanskrit = false;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Check for Section Headers to ignore (e.g., === ... ===)
        if (trimmedLine.startsWith('===')) return;

        // Check for ID
        if (/^\d+-\d+$/.test(trimmedLine)) {
            currentId = trimmedLine.replace('-', '.');
            foundSanskrit = false; // Reset flag for new ID
        } else if (currentId && !foundSanskrit) {
            // First non-empty line after ID is Sanskrit
            // Assuming Sanskrit lines match Devanagari or just taking the first line
            // Check if line contains Devanagari characters could be safer, 
            // but strict order "ID -> Sanskrit -> Transliteration" seems implied.
            // Let's assume the line immediately following ID (skipping empty ones) is Sanskrit.
            data[currentId] = trimmedLine;
            foundSanskrit = true;
        }
    });
    return data;
}

function updateData() {
    try {
        let fileContent = fs.readFileSync(dataFilePath, 'utf-8');

        // Extract the JSON part
        // Assuming file starts with "const sutras = " and ends with optional semicolon
        const prefix = "const sutras = ";
        const startIndex = fileContent.indexOf(prefix);

        if (startIndex === -1) {
            console.error("Could not find 'const sutras = ' in data.js");
            return;
        }

        let jsonString = fileContent.substring(startIndex + prefix.length);
        // Remove trailing semicolon if present
        jsonString = jsonString.trim().replace(/;$/, '');

        let sutras;
        try {
            sutras = JSON.parse(jsonString);
        } catch (e) {
            console.error("Error parsing JSON from data.js:", e);
            // Backup parsing: try using eval (safe if we trust the file, but standard JSON.parse is better)
            // If JSON.parse fails, maybe trailing commas or unquoted keys? 
            // data.js usually corresponds to valid JSON if it was generated/maintained well.
            // Let's assume it is valid JSON.
            return;
        }

        const danData = parseDanFile(danFilePath);
        const sansData = parseSansFile(sansFilePath);

        // Counters for verification
        let wordMeaningsUpdated = 0;
        let sanskritUpdated = 0;

        sutras.forEach(sutra => {
            // Update Word Meanings from 7.dan.txt
            if (danData[sutra.id]) {
                // We want to replace or merge? 
                // Request implies "updating data", usually means replacing with new source of truth.
                // However, preserve any existing keys not in new data? 
                // Usually "update from file" means file is the authority. 
                // Let's overwrite word_meanings with the new object, 
                // OR merge them. 
                // Looking at the previous "Fixing Definition Mismatches" log, accuracy is key.
                // Let's replace the word_meanings object entirely for that sutra 
                // to avoid keeping stale/incorrect old keys.
                sutra.word_meanings = danData[sutra.id];
                wordMeaningsUpdated++;
            }

            // Update Sanskrit from 1.sans.txt
            if (sansData[sutra.id]) {
                sutra.sanskrit = sansData[sutra.id];
                sanskritUpdated++;
            }
        });

        // Serialization
        const newFileContent = `${prefix}${JSON.stringify(sutras, null, 2)};`;
        fs.writeFileSync(dataFilePath, newFileContent, 'utf-8');

        console.log(`Successfully updated data.js`);
        console.log(`Sutras with updated meanings: ${wordMeaningsUpdated}`);
        console.log(`Sutras with updated Sanskrit: ${sanskritUpdated}`);

    } catch (error) {
        console.error("An error occurred during update:", error);
    }
}

updateData();
