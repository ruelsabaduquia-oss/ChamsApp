$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $PSScriptRoot "app/src/main/assets/www"

New-Item -ItemType Directory -Force $assets | Out-Null

$files = @(
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "sw.js",
  "icon.svg",
  "icon-192.png",
  "icon-512.png"
)

foreach ($file in $files) {
  Copy-Item (Join-Path $root $file) (Join-Path $assets $file) -Force
}

Write-Host "Synced web assets to $assets"
