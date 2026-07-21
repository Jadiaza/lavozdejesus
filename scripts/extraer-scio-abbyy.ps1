param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
    [int]$OnlyVolume = 0
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path.TrimEnd('\', '/')
$source = Join-Path $ProjectRoot 'storage\biblia\scio\fuente\abbyy'
$target = Join-Path $ProjectRoot 'storage\biblia\scio\procesado\extraccion'
if (-not (Test-Path -LiteralPath $source -PathType Container)) { throw "No existe $source" }
New-Item -ItemType Directory -Path $target -Force | Out-Null

function Get-VolumeNumber([string]$Name) {
    $match = [regex]::Match($Name, '\[Tomo\s+(\d+)\]', 'IgnoreCase')
    if (-not $match.Success) { return 0 }
    return [int]$match.Groups[1].Value
}

function Get-IntegerAttribute([System.Xml.XmlReader]$Reader, [string]$Name) {
    $value = $Reader.GetAttribute($Name)
    if ([string]::IsNullOrWhiteSpace($value)) { return 0 }
    return [int]$value
}

function New-Block([System.Xml.XmlReader]$Reader, [int]$PageWidth) {
    $left = Get-IntegerAttribute $Reader 'l'
    $right = Get-IntegerAttribute $Reader 'r'
    $middle = if ($PageWidth -gt 0) { $PageWidth / 2 } else { 0 }
    $zone = if ($middle -eq 0 -or ($left -lt $middle -and $right -gt $middle)) { 'full' }
        elseif ($right -le $middle) { 'left' } else { 'right' }
    return [ordered]@{
        tipo = $Reader.GetAttribute('blockType')
        izquierda = $left
        arriba = Get-IntegerAttribute $Reader 't'
        derecha = $right
        abajo = Get-IntegerAttribute $Reader 'b'
        zona = $zone
        texto = ''
    }
}

$inputs = @(Get-ChildItem -LiteralPath $source -File | Where-Object { -not $_.Name.StartsWith('._') } |
    ForEach-Object { [pscustomobject]@{ File = $_; Volume = Get-VolumeNumber $_.Name } } |
    Where-Object { $_.Volume -gt 0 -and ($OnlyVolume -eq 0 -or $_.Volume -eq $OnlyVolume) } |
    Sort-Object Volume)
if (-not $inputs) { throw 'No se encontraron tomos ABBYY para extraer.' }

$summary = @()
foreach ($input in $inputs) {
    $volume = $input.Volume
    $output = Join-Path $target ("tomo-{0:D2}-paginas.jsonl" -f $volume)
    $utf8 = [System.Text.UTF8Encoding]::new($false)
    $writer = [System.IO.StreamWriter]::new($output, $false, $utf8)
    $settings = [System.Xml.XmlReaderSettings]::new()
    $settings.IgnoreWhitespace = $true
    $settings.DtdProcessing = [System.Xml.DtdProcessing]::Prohibit
    $reader = [System.Xml.XmlReader]::Create($input.File.FullName, $settings)
    $pageNumber = 0; $pageWidth = 0; $pageHeight = 0; $blocks = $null; $block = $null
    $buffer = $null; $lineStarted = $false; $pageCount = 0; $blockCount = 0
    try {
        while ($reader.Read()) {
            if ($reader.NodeType -eq [System.Xml.XmlNodeType]::Element -and $reader.LocalName -eq 'page') {
                if (-not [object]::ReferenceEquals($blocks, $null)) {
                    $record = [ordered]@{ esquema='lvj.scio.abbyy-page.v1'; tomo=$volume; pagina=$pageNumber; ancho=$pageWidth; alto=$pageHeight; bloques=$blocks }
                    $writer.WriteLine(($record | ConvertTo-Json -Depth 6 -Compress)); $pageCount++
                    if ($pageNumber % 100 -eq 0) { Write-Host "Tomo $volume`: $pageNumber paginas" }
                }
                $pageNumber++; $pageWidth = Get-IntegerAttribute $reader 'width'; $pageHeight = Get-IntegerAttribute $reader 'height'
                $blocks = [System.Collections.Generic.List[object]]::new()
            } elseif ($reader.NodeType -eq [System.Xml.XmlNodeType]::Element -and $reader.LocalName -eq 'block') {
                $block = New-Block $reader $pageWidth
                $buffer = [System.Text.StringBuilder]::new(); $lineStarted = $false
            } elseif ($block -ne $null -and $reader.NodeType -eq [System.Xml.XmlNodeType]::Element -and $reader.LocalName -eq 'line') {
                if ($buffer.Length -gt 0) { [void]$buffer.Append("`n") }; $lineStarted = $false
            } elseif ($block -ne $null -and $reader.NodeType -eq [System.Xml.XmlNodeType]::Element -and $reader.LocalName -eq 'charParams') {
                $wordStart = $reader.GetAttribute('wordStart') -eq 'true'
                # Avanzar solo hasta el nodo de texto. ReadElementContentAsString deja el
                # lector en el elemento siguiente y el while omitiría un charParams alterno.
                $characters = ''
                if (-not $reader.IsEmptyElement -and $reader.Read()) {
                    if ($reader.NodeType -eq [System.Xml.XmlNodeType]::Text -or $reader.NodeType -eq [System.Xml.XmlNodeType]::Whitespace) {
                        $characters = $reader.Value
                    }
                }
                if ($wordStart -and $lineStarted -and $buffer.Length -gt 0 -and $buffer[$buffer.Length - 1] -ne ' ') { [void]$buffer.Append(' ') }
                [void]$buffer.Append($characters); $lineStarted = $true
            } elseif ($block -ne $null -and $reader.NodeType -eq [System.Xml.XmlNodeType]::EndElement -and $reader.LocalName -eq 'block') {
                $block.texto = $buffer.ToString().Trim()
                if ($block.texto -ne '') { $blocks.Add([pscustomobject]$block); $blockCount++ }
                $block = $null; $buffer = $null
            }
        }
        if (-not [object]::ReferenceEquals($blocks, $null)) {
            $record = [ordered]@{ esquema='lvj.scio.abbyy-page.v1'; tomo=$volume; pagina=$pageNumber; ancho=$pageWidth; alto=$pageHeight; bloques=$blocks }
            $writer.WriteLine(($record | ConvertTo-Json -Depth 6 -Compress)); $pageCount++
        }
    } finally {
        $reader.Dispose(); $writer.Dispose()
    }
    $summary += [ordered]@{ tomo=$volume; fuente=$input.File.Name; salida=(Split-Path $output -Leaf); paginas=$pageCount; bloques=$blockCount; bytes=(Get-Item $output).Length }
}

$manifestPath = Join-Path $target 'manifiesto-extraccion.json'
if ($OnlyVolume -gt 0 -and (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    $previous = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    $summary = @($previous.tomos | Where-Object { [int]$_.tomo -ne $OnlyVolume }) + @($summary)
    $summary = @($summary | Sort-Object { [int]$_.tomo })
}
$manifest = [ordered]@{ esquema='lvj.scio.abbyy-extraction.v1'; generado_utc=[DateTime]::UtcNow.ToString('o'); tomos=$summary }
[IO.File]::WriteAllText($manifestPath, ($manifest | ConvertTo-Json -Depth 6) + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
Write-Host "Extraccion terminada: $manifestPath"
