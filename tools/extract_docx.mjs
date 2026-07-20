// Extract docx text content using Node.js built-in zlib + simple XML parsing
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { gunzipSync } from 'zlib';

// A docx file is a ZIP archive. Each entry is a local file header + compressed data.
// We'll find the word/document.xml entry and extract <w:t> text elements using regex.
// This avoids needing any external libraries.

function findCentralDirectory(buffer) {
    // Search backwards for end of central directory signature: 0x06054b50
    for (let i = buffer.length - 22; i >= 0; i--) {
        if (buffer[i] === 0x50 && buffer[i+1] === 0x4b &&
            buffer[i+2] === 0x05 && buffer[i+3] === 0x06) {
            return i;
        }
    }
    return -1;
}

function readZipEntry(buffer, centralDirOffset, filename) {
    // Read end of central directory
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const totalEntries = view.getUint16(centralDirOffset + 10, true);
    const cdSize = view.getUint32(centralDirOffset + 12, true);
    const cdOffset = view.getUint32(centralDirOffset + 16, true);

    // Search central directory for the filename
    let offset = cdOffset;
    for (let i = 0; i < totalEntries; i++) {
        const sig = view.getUint32(offset, true);
        if (sig !== 0x02014b50) break;

        const nameLen = view.getUint16(offset + 28, true);
        const extraLen = view.getUint16(offset + 30, true);
        const commentLen = view.getUint16(offset + 32, true);
        const localHeaderOffset = view.getUint32(offset + 42, true);

        const name = buffer.toString('utf-8', offset + 46, offset + 46 + nameLen);

        if (name === filename) {
            // Read local file header
            const lhOffset = localHeaderOffset;
            const lhNameLen = view.getUint16(lhOffset + 26, true);
            const lhExtraLen = view.getUint16(lhOffset + 28, true);
            const compSize = view.getUint32(lhOffset + 20, true);
            const compMethod = view.getUint16(lhOffset + 10, true);

            const dataStart = lhOffset + 30 + lhNameLen + lhExtraLen;
            const compressed = buffer.subarray(dataStart, dataStart + compSize);

            if (compMethod === 8) { // DEFLATE
                return gunzipSync(compressed).toString('utf-8');
            } else if (compMethod === 0) { // STORE
                return compressed.toString('utf-8');
            }
        }

        offset += 46 + nameLen + extraLen + commentLen;
    }
    return null;
}

// Main
const docxPath = 'F:/桌面/齐鲁工业大学（山东省科学院）最强新生攻略大全（无水印）.docx';
const outPath = 'F:/桌面/qlu-campus-guide/knowledge/新生攻略原文.txt';

try {
    const buffer = readFileSync(docxPath);
    const cdOffset = findCentralDirectory(buffer);

    if (cdOffset === -1) {
        console.error('Not a valid ZIP file');
        process.exit(1);
    }

    const xml = readZipEntry(buffer, cdOffset, 'word/document.xml');
    if (!xml) {
        console.error('word/document.xml not found');
        process.exit(1);
    }

    // Extract all <w:t> text elements
    const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    const texts = [];
    let match;
    while ((match = textRegex.exec(xml)) !== null) {
        texts.push(match[1]);
    }

    // Join consecutive text elements with paragraph breaks
    // We need to identify paragraph boundaries. Let's re-parse with paragraph awareness.
    const paraRegex = /<w:p[ >][\s\S]*?<\/w:p>/g;
    const paragraphs = [];
    let paraMatch;
    while ((paraMatch = paraRegex.exec(xml)) !== null) {
        const paraTexts = [];
        const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
        let tMatch;
        while ((tMatch = tRegex.exec(paraMatch[0])) !== null) {
            paraTexts.push(tMatch[1]);
        }
        const paraText = paraTexts.join('');
        if (paraText.trim()) {
            paragraphs.push(paraText);
        }
    }

    const fullText = paragraphs.join('\n');
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, fullText, 'utf-8');

    console.log(`Extracted ${texts.length} text nodes in ${paragraphs.length} paragraphs`);
    console.log(`Total chars: ${fullText.length}`);
    console.log(`Written to: ${outPath}`);
    console.log('');
    console.log('=== FIRST 200 LINES (with content) ===');
    paragraphs.slice(0, 200).forEach((p, i) => {
        console.log(`[${i}] ${p.substring(0, 200)}`);
    });
} catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
}
