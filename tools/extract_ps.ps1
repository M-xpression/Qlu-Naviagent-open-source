Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('F:\桌面\齐鲁工业大学（山东省科学院）最强新生攻略大全（无水印）(1).docx')
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()

# Remove namespace prefixes for easier parsing
$xml = $xml -replace '<[^>]*?:', '<' -replace '</[^>]*?:', '</'

$lines = @()
$paras = [regex]::Matches($xml, '<p[ >][\s\S]*?</p>')
foreach ($p in $paras) {
    $texts = [regex]::Matches($p.Value, '<t[^>]*>([^<]*)</t>')
    $line = ($texts | ForEach-Object { $_.Groups[1].Value }) -join ''
    if ($line.Trim()) { $lines += $line.Trim() }
}

$out = 'F:\桌面\qlu-campus-guide\knowledge\新生攻略原文_v3.txt'
$lines -join "`n" | Out-File -FilePath $out -Encoding UTF8
Write-Output "Extracted $($lines.Count) lines, $($($lines -join '').Length) chars"
$lines | Select-Object -First 100 | ForEach-Object { Write-Output $_ }
