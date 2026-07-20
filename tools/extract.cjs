const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const { gunzipSync } = require('zlib');
const path = require('path');

function findCentralDirectory(buf) {
    for (let i = buf.length - 22; i >= 0; i--)
        if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x05 && buf[i+3] === 0x06) return i;
    return -1;
}

function readZipEntry(buf, cdOff, filename) {
    const v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const total = v.getUint16(cdOff + 10, true);
    const cdStart = v.getUint32(cdOff + 16, true);
    let off = cdStart;
    for (let i = 0; i < total; i++) {
        const sig = v.getUint32(off, true);
        if (sig !== 0x02014b50) break;
        const nl = v.getUint16(off + 28, true);
        const el = v.getUint16(off + 30, true);
        const cl = v.getUint16(off + 32, true);
        const lh = v.getUint32(off + 42, true);
        const name = buf.toString('utf-8', off + 46, off + 46 + nl);
        if (name === filename) {
            const ln = v.getUint16(lh + 26, true);
            const le = v.getUint16(lh + 28, true);
            const cs = v.getUint32(lh + 20, true);
            const cm = v.getUint16(lh + 10, true);
            const ds = lh + 30 + ln + le;
            const compressed = buf.subarray(ds, ds + cs);
            return cm === 8 ? gunzipSync(compressed).toString('utf-8') : compressed.toString('utf-8');
        }
        off += 46 + nl + el + cl;
    }
    return null;
}

const docxPath = 'F:\\桌面\\齐鲁工业大学（山东省科学院）最强新生攻略大全（无水印）.docx';
const outPath = 'F:\\桌面\\qlu-campus-guide\\knowledge\\新生攻略原文.txt';

try {
    const buffer = readFileSync(docxPath);
    const cdOffset = findCentralDirectory(buffer);
    if (cdOffset === -1) { console.error('Not a valid ZIP'); process.exit(1); }
    const xml = readZipEntry(buffer, cdOffset, 'word/document.xml');
    if (!xml) {
        // Try to list files in the archive
        console.error('word/document.xml not found. Listing archive:');
        const v = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        const total = v.getUint16(cdOffset + 10, true);
        const cdStart = v.getUint32(cdOffset + 16, true);
        let off = cdStart;
        for (let i = 0; i < total && i < 30; i++) {
            const nl = v.getUint16(off + 28, true);
            const name = buffer.toString('utf-8', off + 46, off + 46 + nl);
            console.log('  ', name);
            off += 46 + nl + v.getUint16(off + 30, true) + v.getUint16(off + 32, true);
        }
        process.exit(1);
    }

    // Debug: show XML snippet
    console.log('XML length:', xml.length);
    console.log('XML first 500 chars:');
    console.log(xml.substring(0, 500));
    console.log('');

    // Simple extraction: find ALL <w:t>...</w:t> in order, track <w:p> boundaries
    // This is more robust than trying to match <w:p>...</w:p> blocks

    const paragraphs = [];
    // Split on <w:p> or <w:p ...>
    const pParts = xml.split(/<w:p[ >]/);
    console.log('Found', pParts.length, 'paragraph parts');

    let count = 0;
    for (let i = 1; i < pParts.length; i++) { // skip first (before first <w:p>)
        const part = pParts[i];
        const texts = [];
        const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
        let tm;
        while ((tm = tRegex.exec(part)) !== null) {
            texts.push(tm[1]);
        }
        const text = texts.join('').trim();
        if (text) {
            paragraphs.push(text);
            count++;
            if (count <= 50) console.log('[' + count + '] ' + text.substring(0, 200));
        }
    }
    console.log('... Total content paragraphs:', paragraphs.length);

    const fullText = paragraphs.join('\n');
    const dir = path.dirname(outPath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(outPath, fullText, 'utf-8');

    console.log('Total chars:', fullText.length);
    console.log('Written to:', outPath);
} catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
}
