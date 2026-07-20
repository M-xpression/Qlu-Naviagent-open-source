// Try alternative approach: use central directory size and data descriptor aware extraction
const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const { gunzipSync, inflateRawSync } = require('zlib');
const path = require('path');

function extractDocx(filePath) {
    const buf = readFileSync(filePath);
    const len = buf.length;

    // Find EOCD
    let eocd = -1;
    for (let i = len - 22; i >= 0 && i >= len - 66000; i--) {
        if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x05 && buf[i+3] === 0x06) {
            eocd = i;
            break;
        }
    }
    if (eocd === -1) throw new Error('Not a ZIP');

    const view = new DataView(new Uint8Array(buf).buffer);
    const cdOffset = view.getUint32(eocd + 16, true);
    const cdSize = view.getUint32(eocd + 12, true);
    const totalEntries = view.getUint16(eocd + 10, true);

    console.log('Total entries:', totalEntries, 'CD at:', cdOffset, 'size:', cdSize);

    // Iterate central directory to find word/document.xml
    let pos = cdOffset;
    for (let i = 0; i < totalEntries; i++) {
        const nameLen = view.getUint16(pos + 28, true);
        const extraLen = view.getUint16(pos + 30, true);
        const commentLen = view.getUint16(pos + 32, true);
        const localHeader = view.getUint32(pos + 42, true);
        const name = buf.toString('utf-8', pos + 46, pos + 46 + nameLen);

        if (name === 'word/document.xml') {
            console.log('Found word/document.xml at local header:', localHeader);

            const compSize = view.getUint32(pos + 20, true);
            const uncompSize = view.getUint32(pos + 24, true);
            const compMethod = view.getUint16(pos + 10, true);
            const lhNameLen = view.getUint16(localHeader + 26, true);
            const lhExtraLen = view.getUint16(localHeader + 28, true);
            const bit3 = view.getUint16(pos + 8, true) & 0x8;

            const dataStart = localHeader + 30 + lhNameLen + lhExtraLen;
            let actualCompSize = compSize;

            // If bit 3 is set, size is in data descriptor after the data
            if (bit3 || compSize === 0) {
                console.log('Bit 3 set or compSize=0, searching for data descriptor...');
                // Search for data descriptor signature (0x08074b50) after data
                let searchStart = dataStart;
                if (uncompSize > 0) {
                    // Use uncompressed size to estimate
                    actualCompSize = uncompSize;
                } else {
                    // Brute force: look for next local file header or central directory
                    for (let j = dataStart; j < len - 4; j++) {
                        if (buf[j] === 0x50 && buf[j+1] === 0x4b) {
                            const sig = view.getUint32(j, true);
                            if (sig === 0x02014b50 || sig === 0x04034b50) {
                                actualCompSize = j - dataStart;
                                break;
                            }
                        }
                    }
                }
            }

            console.log('Comp method:', compMethod, 'Comp size:', actualCompSize, 'Uncomp size:', uncompSize);
            const data = buf.subarray(dataStart, dataStart + actualCompSize);

            if (compMethod === 8) {
                try {
                    return gunzipSync(data).toString('utf-8');
                } catch (e) {
                    console.log('gunzip failed:', e.message, 'trying inflateRaw...');
                    try {
                        return inflateRawSync(data).toString('utf-8');
                    } catch (e2) {
                        console.log('inflateRaw also failed:', e2.message);
                        // Return as-is, maybe it's not compressed
                        return data.toString('utf-8');
                    }
                }
            }
            return data.toString('utf-8');
        }
        pos += 46 + nameLen + extraLen + commentLen;
    }
    throw new Error('word/document.xml not found');
}

try {
    const xml = extractDocx('F:\\桌面\\齐鲁工业大学（山东省科学院）最强新生攻略大全（无水印）.docx');

    console.log('XML length:', xml.length);
    console.log('First 500 chars:');
    console.log(xml.substring(0, 500));

    // Extract text
    const paragraphs = [];
    const pParts = xml.split(/<w:p[ >]/);
    console.log('\nFound', pParts.length, 'paragraph parts');

    for (let i = 1; i < pParts.length; i++) {
        const texts = [];
        const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
        let tm;
        while ((tm = tRegex.exec(pParts[i])) !== null) {
            texts.push(tm[1]);
        }
        const text = texts.join('').trim();
        if (text) paragraphs.push(text);
    }

    const outPath = 'F:\\桌面\\qlu-campus-guide\\knowledge\\新生攻略原文.txt';
    const fullText = paragraphs.join('\n');
    const dir = path.dirname(outPath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(outPath, fullText, 'utf-8');

    console.log('\nParagraphs:', paragraphs.length);
    console.log('Total chars:', fullText.length);
    console.log('\n=== Content ===');
    paragraphs.forEach((p, i) => console.log('[' + i + ']', p.substring(0, 200)));
} catch (e) {
    console.error('Error:', e.message);
}
