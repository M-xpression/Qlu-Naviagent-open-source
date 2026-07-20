const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const { gunzipSync, inflateRawSync } = require('zlib');
const path = require('path');

const docxPath = 'F:\\桌面\\齐鲁工业大学（山东省科学院）最强新生攻略大全（无水印）(1).docx';
const outPath = 'F:\\桌面\\qlu-campus-guide\\knowledge\\新生攻略原文_v2.txt';

const buf = readFileSync(docxPath);
let cd = -1;
for (let i = buf.length - 22; i >= 0; i--) {
    if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x05 && buf[i+3] === 0x06) { cd = i; break; }
}
const v = new DataView(new Uint8Array(buf).buffer);
const total = v.getUint16(cd + 10, true);
const cdStart = v.getUint32(cd + 16, true);
let pos = cdStart;
let xml = null;

for (let i = 0; i < total; i++) {
    const nl = v.getUint16(pos + 28, true), el = v.getUint16(pos + 30, true), cl = v.getUint16(pos + 32, true);
    const lh = v.getUint32(pos + 42, true);
    const name = buf.toString('utf8', pos + 46, pos + 46 + nl);
    if (name === 'word/document.xml') {
        const ln = v.getUint16(lh + 26, true), le = v.getUint16(lh + 28, true);
        const cs = v.getUint32(lh + 20, true), cm = v.getUint16(lh + 10, true);
        const bit3 = (v.getUint16(pos + 8, true) & 0x8) !== 0;
        const ds = lh + 30 + ln + le;
        let actualCs = cs;
        if (bit3 || cs === 0) {
            for (let j = ds; j < buf.length - 4; j++) {
                if (buf[j] === 0x50 && buf[j+1] === 0x4b) {
                    const sig = v.getUint32(j, true);
                    if (sig === 0x02014b50 || sig === 0x04034b50) { actualCs = j - ds; break; }
                }
            }
        }
        const comp = buf.subarray(ds, ds + actualCs);
        console.log('Comp method:', cm, 'size:', cs, 'actual:', actualCs, 'bit3:', bit3);
        // Try multiple decompression methods
        for (const [name, fn] of [['gunzip', gunzipSync], ['inflateRaw', inflateRawSync]]) {
            try {
                xml = fn(comp).toString('utf8');
                if (xml.startsWith('<?xml') || xml.includes('<w:document')) {
                    console.log('Success with', name);
                    break;
                }
            } catch (e) { console.log(name, 'failed:', e.message.slice(0, 40)); }
        }
        break;
    }
    pos += 46 + nl + el + cl;
}
if (!xml) { console.error('Could not decompress'); process.exit(1); }

console.log('XML length:', xml.length, 'starts:', xml.substring(0, 100));

// Try multiple paragraph split patterns
const pts = [];
// Pattern 1: <w:p ...>...</w:p>
let pParts = xml.split(/<w:p[ >]/);
if (pParts.length < 2) pParts = xml.split(/<w:p>/);
if (pParts.length < 2) pParts = xml.split(/<w:p\s/);
console.log('Paragraph parts:', pParts.length);

for (let i = 1; i < pParts.length; i++) {
    const ts = [];
    const tr = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let tm;
    while ((tm = tr.exec(pParts[i])) !== null) ts.push(tm[1]);
    const t = ts.join('').trim();
    if (t) pts.push(t);
}

const full = pts.join('\n');
const dir = path.dirname(outPath);
mkdirSync(dir, { recursive: true });
writeFileSync(outPath, full, 'utf8');
console.log(pts.length, 'lines,', full.length, 'chars');
if (pts.length > 0) pts.slice(0, 100).forEach((l, i) => console.log('[' + i + ']', l.substring(0, 300)));
