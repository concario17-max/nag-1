const fs = require('fs');
const path = require('path');

// Mock DOM elements and window if needed, or just extract logic
// We just want to test value processing.

// Load data.js
// data.js starts with "const sutras = ..."
// We'll read it and eval it (safe enough here as it's local file)
const projectRoot = path.resolve(__dirname, '..');
const dataContent = fs.readFileSync(path.join(projectRoot, 'data.js'), 'utf8');
// Remove "const " and run
const sutras = eval(dataContent.replace('const sutras =', ''));

console.log(`Loaded ${sutras.length} sutras.`);

function testRender() {
    let errorCount = 0;
    sutras.forEach(sutra => {
        try {
            if (sutra.word_meanings && sutra.pronunciation) {
                // Helper to remove diacritics for key matching
                const normalizeKey = (str) => {
                    return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
                };

                const words = sutra.pronunciation.split(' ');
                words.map((word, index) => {
                    // Clean punctuation
                    const cleanWord = word.replace(/[.,;:]/g, '');
                    const lowerCleanWord = cleanWord.toLowerCase();

                    let key = null;

                    // Safety check for word_meanings
                    if (sutra.word_meanings) {
                        // 1. Try exact match (case-insensitive)
                        key = Object.keys(sutra.word_meanings).find(k => k.toLowerCase() === lowerCleanWord);

                        // 2. Try normalized match (remove diacritics)
                        if (!key) {
                            const normWord = normalizeKey(cleanWord);
                            key = Object.keys(sutra.word_meanings).find(k => normalizeKey(k) === normWord);
                        }

                        // 3. Try variations (handling Visarga 'ḥ' -> 'h', Anusvara 'ṃ' -> 'm', etc.)
                        if (!key) {
                            const normWord = normalizeKey(cleanWord);
                            const variations = [
                                normWord + "h",
                                normWord + "m",
                                normWord + "s",
                                normWord.replace(/h$/, ''),
                                normWord.replace(/m$/, ''),
                                normWord.replace(/s$/, '')
                            ];

                            for (const v of variations) {
                                key = Object.keys(sutra.word_meanings).find(k => normalizeKey(k) === v);
                                if (key) break;
                            }
                        }

                        // 4. Fallback: Sequential mapping
                        if (!key) {
                            const meaningKeys = Object.keys(sutra.word_meanings);
                            if (index < meaningKeys.length) {
                                key = meaningKeys[index];
                            }
                        }
                    }

                    if (key && sutra.word_meanings[key]) {
                        // Success
                    }
                    return word;
                });
            }
        } catch (err) {
            console.error(`Error rendering sutra ${sutra.id}:`, err);
            errorCount++;
        }
    });

    if (errorCount === 0) {
        console.log("No rendering errors found with current logic.");
    } else {
        console.log(`Found ${errorCount} errors.`);
    }
}

testRender();
