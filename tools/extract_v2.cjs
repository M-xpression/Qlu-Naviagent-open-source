const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const { gunzipSync } = require('zlib');
const path = require('path');

const docxPath = process.argv[2];
const outPath = process.argv[3] || docxPath.replace('.docx', '.txt');

function findCD(buf) {
    for (let i = buf.length - 22; i >= 0; i--)
        if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x05 && buf[i+3] === 0x06) return i;
    return -1;
}

function readEntry(buf, cdOff, filename) {
    const v = new DataView(new Uint8Array(buf).buffer);
    const total = v.getUint16(cdOff + 10, true);
    const cdStart = v.getUint32(cdOff + 16, true);
    let pos = cdStart;
    for (let i = 0; i < total; i++) {
        const nl = v.getUint16(pos + 28, true), el = v.getUint16(pos + 30, true), cl = v.getUint16(pos + 32, true);
        const lh = v.getUint32(pos + 42, true);
        const name = buf.toString('utf-8', pos + 46, pos + 46 + nl);
        if (name === filename) {
            const ln = v.getUint16(lh + 26, true), le = v.getUint16(lh + 28, true);
            const cs = v.getUint32(lh + 20, true), cm = v.getUint16(lh + 10, true);
            const ds = lh + 30 + ln + le;
            const compressed = buf.subarray(ds, ds + cs);
            return cm === 8 ? gunzipSync(compressed).toString('utf-8') : compressed.toString('utf-8');
        }
        pos += 46 + nl + el + cl;
    }
    return null;
}

try {
    const buf = readFileSync(docxPath);
    const cd = findCD(buf);
    const xml = readEntry(buf, cd, 'word/document.xml');

    const paragraphs = [];
    const pParts = xml.split(/<w:p[ >]/);
    for (let i = 1; i < pParts.length; i++) {
        const texts = [];
        const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
        let tm;
        while ((tm = tRegex.exec(pParts[i])) !== null) texts.push(tm[1]);
        const text = texts.join('').trim();
        if (text) paragraphs.push(text);
    }

    const fullText = paragraphs.join('\n');
    const dir = path.dirname(outPath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(outPath, fullText, 'utf-8');

    console.log('Paragraphs:', paragraphs.length, 'Chars:', fullText.length);
    paragraphs.forEach((p, i) => console.log('[' + i + ']', p.substring(0, 200)));
} catch (e) {
    console.error('Error:', e.message);
}
