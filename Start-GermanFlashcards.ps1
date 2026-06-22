param(
  [int]$Port = 8780
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)
$Types = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".txt" = "text/plain; charset=utf-8"
  ".svg" = "image/svg+xml"
}

function Send-Response {
  param(
    [System.Net.Sockets.TcpClient]$Client,
    [int]$StatusCode,
    [string]$StatusText,
    [byte[]]$Body,
    [string]$ContentType = "text/plain; charset=utf-8"
  )

  $Stream = $Client.GetStream()
  $Header = [System.Text.Encoding]::ASCII.GetBytes(
    "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
  )
  $Stream.Write($Header, 0, $Header.Length)
  $Stream.Write($Body, 0, $Body.Length)
}

$Listener.Start()
Write-Host "German Flashcards running at http://127.0.0.1:$Port/"

try {
  while ($true) {
    $Client = $Listener.AcceptTcpClient()
    try {
      $Stream = $Client.GetStream()
      $Reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $Line = $Reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($Line)) {
        continue
      }

      while (($Header = $Reader.ReadLine()) -ne $null -and $Header -ne "") {}

      $RequestPath = "/"
      if ($Line -match "^[A-Z]+\s+([^\s]+)") {
        $RequestPath = $Matches[1].Split("?")[0]
      }

      $RelativePath = [Uri]::UnescapeDataString($RequestPath.TrimStart("/"))
      if ([string]::IsNullOrWhiteSpace($RelativePath)) {
        $RelativePath = "index.html"
      }

      $FullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($Root, $RelativePath))
      $RootPath = [System.IO.Path]::GetFullPath($Root)

      if (-not $FullPath.StartsWith($RootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        Send-Response $Client 403 "Forbidden" ([System.Text.Encoding]::UTF8.GetBytes("Forbidden"))
        continue
      }

      if (-not [System.IO.File]::Exists($FullPath)) {
        Send-Response $Client 404 "Not Found" ([System.Text.Encoding]::UTF8.GetBytes("Not found"))
        continue
      }

      $Extension = [System.IO.Path]::GetExtension($FullPath).ToLowerInvariant()
      $ContentType = if ($Types.ContainsKey($Extension)) { $Types[$Extension] } else { "application/octet-stream" }
      $Bytes = [System.IO.File]::ReadAllBytes($FullPath)
      Send-Response $Client 200 "OK" $Bytes $ContentType
    } catch {
      try {
        $Message = [System.Text.Encoding]::UTF8.GetBytes("Server error")
        Send-Response $Client 500 "Internal Server Error" $Message
      } catch {
        # Clients such as port probes may disconnect before a response is written.
      }
    } finally {
      $Client.Close()
    }
  }
} finally {
  $Listener.Stop()
}
