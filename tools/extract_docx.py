import zipfile
import os
from xml.etree import ElementTree as ET

docx_path = r'F:\桌面\齐鲁工业大学（山东省科学院）最强新生攻略大全（无水印）.docx'
out_path = r'F:\桌面\qlu-campus-guide\knowledge\新生攻略原文.txt'

with zipfile.ZipFile(docx_path, 'r') as z:
    xml_content = z.read('word/document.xml')

tree = ET.fromstring(xml_content)
ns = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

paragraphs = []
for p in tree.iter(f'{ns}p'):
    texts = []
    for t in p.iter(f'{ns}t'):
        if t.text:
            texts.append(t.text)
    line = ''.join(texts)
    paragraphs.append(line)

full_text = '\n'.join(paragraphs)

os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(full_text)

print(f'Total characters: {len(full_text)}')
print(f'Total paragraphs: {len(paragraphs)}')
print('=== FIRST 150 NON-EMPTY LINES ===')
count = 0
for line in paragraphs:
    s = line.strip()
    if s:
        print(f'[{count}] {s[:150]}')
        count += 1
        if count >= 150:
            break
