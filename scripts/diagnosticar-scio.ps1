param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path.TrimEnd('\', '/')
$sourceRoot = Join-Path $ProjectRoot 'storage\biblia\scio\fuente'
$reportPath = Join-Path $ProjectRoot 'storage\biblia\scio\procesado\reportes\diagnostico-fuentes.json'

if (-not (Test-Path -LiteralPath $sourceRoot -PathType Container)) {
    throw "No existe la fuente de Scio: $sourceRoot"
}

function Get-RelativeProjectPath([string]$Path) {
    $resolvedPath = [IO.Path]::GetFullPath($Path)
    if (-not $resolvedPath.StartsWith($ProjectRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw "La ruta esta fuera del proyecto: $resolvedPath"
    }
    return $resolvedPath.Substring($ProjectRoot.Length).TrimStart('\', '/').Replace('\', '/')
}

function New-FileItem([IO.FileInfo]$File) {
    return [ordered]@{
        name = $File.Name
        path = Get-RelativeProjectPath $File.FullName
        size = $File.Length
        modified_at = $File.LastWriteTimeUtc.ToString('yyyy-MM-dd HH:mm:ss')
        valid = $File.Length -gt 0
    }
}

$sourceFiles = @(Get-ChildItem -LiteralPath $sourceRoot -File -Recurse | Where-Object {
    $_.Name -ne '.DS_Store' -and -not $_.Name.StartsWith('._')
})
$txt = @($sourceFiles | Where-Object {
    $_.Extension -ieq '.txt' -and $_.FullName -notmatch '[\\/]abbyy[\\/]'
} | Sort-Object Name | ForEach-Object { New-FileItem $_ })
$epub = @($sourceFiles | Where-Object { $_.Extension -ieq '.epub' } |
    Sort-Object Name | ForEach-Object { New-FileItem $_ })
$abbyy = @($sourceFiles | Where-Object {
    $_.Extension -ieq '.abbyy' -or $_.FullName -match '[\\/]abbyy[\\/]'
} | Sort-Object Name | ForEach-Object {
    [ordered]@{
        name = $_.BaseName
        files = 1
        size = $_.Length
        valid = $_.Length -gt 0
    }
})

function New-Group([array]$Items, [int]$Expected, [string]$Unit, [bool]$Required) {
    $validCount = @($Items | Where-Object { $_.valid }).Count
    $complete = if ($Required) {
        $Items.Count -eq $Expected -and $validCount -eq $Expected
    } else {
        $Items.Count -eq 0 -or ($Items.Count -eq $Expected -and $validCount -eq $Expected)
    }
    return [ordered]@{
        items = $Items
        count = $Items.Count
        valid_count = $validCount
        expected = $Expected
        unit = $Unit
        required = $Required
        complete = $complete
    }
}

$groups = [ordered]@{
    txt = New-Group $txt 15 'archivos' $true
    abbyy = New-Group $abbyy 15 'tomos' $true
    epub = New-Group $epub 1 'archivo' $false
}
$report = [ordered]@{
    schema = 'lvj.scio.source-diagnostic.v1'
    generated_at = [DateTime]::UtcNow.ToString('o')
    source_path = 'storage/biblia/scio/fuente'
    complete = $groups.txt.complete -and $groups.abbyy.complete
    groups = $groups
}

$reportDirectory = Split-Path -Parent $reportPath
New-Item -ItemType Directory -Path $reportDirectory -Force | Out-Null
$json = $report | ConvertTo-Json -Depth 8
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($reportPath, $json + [Environment]::NewLine, $utf8WithoutBom)

Write-Host "Diagnostico Scio generado:"
Write-Host "  TXT:   $($groups.txt.valid_count)/15"
Write-Host "  ABBYY: $($groups.abbyy.valid_count)/15"
Write-Host "  EPUB:  $($groups.epub.valid_count) (opcional)"
Write-Host "  Informe: $reportPath"
