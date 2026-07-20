// Simple script, no ESM imports needed
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const docxPath = 'F:\\桌面\\齐鲁工业大学（山东省科学院）最强新生攻略大全（无水印）(1).docx';
const outPath = 'F:\\桌面\\qlu-campus-guide\\knowledge\\新生攻略原文_v3.txt';

function run() {
    const buf = fs.readFileSync(docxPath);
    let cd = -1;
    for (let i = buf.length - 22; i >= 0; i--) {
        if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x05 && buf[i+3] === 0x06) {
            cd = i; break;
        }
    }
    const v = new DataView(new Uint8Array(buf).buffer);
    const total = v.getUint16(cd + 10, true);
    const cdStart = v.getUint32(cd + 16, true);
    let pos = cdStart, xml = null;
    for (let i = 0; i < total; i++) {
        const nl = v.getUint16(pos + 28, true), el = v.getUint16(pos + 30, true), cl = v.getUint16(pos + 32, true);
        const lh = v.getUint32(pos + 42, true);
        const name = buf.toString('utf8', pos + 46, pos + 46 + nl);
        if (name === 'word/document.xml') {
            const ln = v.getUint16(lh + 26, true), le = v.getUint16(lh + 28, true);
            const cs = v.getUint32(lh + 20, true), cm = v.getUint16(lh + 10, true);
            const ds = lh + 30 + ln + le;
            const comp = buf.subarray(ds, ds + cs);
            try { xml = zlib.gunzipSync(comp).toString('utf8'); } catch (e1) {
                try { xml = zlib.inflateRawSync(comp).toString('utf8'); } catch (e2) {
                    xml = comp.toString('utf8');
                }
            }
            break;
        }
        pos += 46 + nl + el + cl;
    }
    if (!xml) { console.error('not found'); return; }

    const pts = [];
    const pParts = xml.split(/<w:p[ >]/);
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
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outPath, full, 'utf8');
    console.log('Lines:', pts.length, 'Chars:', full.length);
    console.log('---');
    pts.forEach((l, i) => console.log('[' + i + ']', l.substring(0, 300)));
}

run();
