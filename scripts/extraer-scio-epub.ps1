param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))

$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$source = Join-Path $ProjectRoot 'storage\biblia\scio\fuente\epub'
$target = Join-Path $ProjectRoot 'storage\biblia\scio\procesado\extraccion-epub'
New-Item -ItemType Directory -Path $target -Force | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem

$files = @(Get-ChildItem -LiteralPath $source -File -Filter '*.epub' | Where-Object { -not $_.Name.StartsWith('._') })
if ($files.Count -ne 15) { throw "Se requieren 15 EPUB; se encontraron $($files.Count)." }
$summary = [System.Collections.Generic.List[object]]::new()
$utf8 = [Text.UTF8Encoding]::new($false)

foreach ($file in $files) {
    $match = [regex]::Match($file.Name, '\[Tomo\s+(\d+)\]', 'IgnoreCase')
    if (-not $match.Success) { continue }
    $volume = [int]$match.Groups[1].Value
    $output = Join-Path $target ("tomo-{0:D2}-paginas.jsonl" -f $volume)
    $writer = [IO.StreamWriter]::new($output, $false, $utf8)
    $zip = [IO.Compression.ZipFile]::OpenRead($file.FullName)
    $count = 0; $empty = 0; $imageOnly = 0
    try {
        $entries = @($zip.Entries | Where-Object { $_.FullName -match '^EPUB/page_(\d+)\.html$' } | Sort-Object { [int]([regex]::Match($_.FullName, 'page_(\d+)').Groups[1].Value) })
        foreach ($entry in $entries) {
            $page = [int]([regex]::Match($entry.FullName, 'page_(\d+)').Groups[1].Value)
            $reader = [IO.StreamReader]::new($entry.Open())
            try { $html = $reader.ReadToEnd() } finally { $reader.Dispose() }
            $accuracyMatch = [regex]::Match($html, 'estimated to be only\s+([0-9.]+)% accurate', 'IgnoreCase')
            $accuracy = if ($accuracyMatch.Success) { [double]$accuracyMatch.Groups[1].Value } else { $null }
            $hasImage = $html -match '<img\s'
            $text = [Net.WebUtility]::HtmlDecode(($html -replace '(?is)<head.*?</head>', ' ' -replace '(?is)<[^>]+>', ' ' -replace '\s+', ' ')).Trim()
            $text = ($text -replace '^The text on this page is estimated to be only [0-9.]+% accurate\s*', '').Trim()
            if ($text -eq '') { $empty++ }
            if ($hasImage -and $text.Length -lt 10) { $imageOnly++ }
            $record = [ordered]@{ schema='lvj.scio.epub-page.v1'; tomo=$volume; pagina_epub=$page; texto=$text; precision_estimada=$accuracy; contiene_imagen=$hasImage }
            $writer.WriteLine(($record | ConvertTo-Json -Compress)); $count++
        }
    } finally { $zip.Dispose(); $writer.Dispose() }
    $summary.Add([pscustomobject][ordered]@{ tomo=$volume; archivo=$file.Name; paginas=$count; vacias=$empty; solo_imagen=$imageOnly; salida=(Split-Path $output -Leaf); bytes=(Get-Item $output).Length })
    Write-Host "Tomo $volume`: $count paginas HTML"
}
$summary = @($summary | Sort-Object tomo)
$manifest = [ordered]@{ schema='lvj.scio.epub-extraction.v1'; generated_at=[DateTime]::UtcNow.ToString('o'); tomos=$summary }
[IO.File]::WriteAllText((Join-Path $target 'manifiesto-extraccion-epub.json'), ($manifest | ConvertTo-Json -Depth 6) + [Environment]::NewLine, $utf8)
Write-Host "Extraccion EPUB terminada: $($summary.Count)/15 tomos"
