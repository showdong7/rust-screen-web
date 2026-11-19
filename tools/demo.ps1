param([string]$Out, [int]$X = 400, [int]$Y = 220, [switch]$Show)
Add-Type -AssemblyName System.Drawing, System.Windows.Forms
Add-Type -TypeDefinition 'using System.Runtime.InteropServices; public static class Dpi { [DllImport("user32.dll")] public static extern bool SetProcessDPIAware(); [DllImport("user32.dll")] public static extern bool ShowWindow(System.IntPtr h, int c); }'
[void][Dpi]::SetProcessDPIAware()

$W = 1120; $H = 700
$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'ClearTypeGridFit'
function C($hex) { [System.Drawing.ColorTranslator]::FromHtml($hex) }
function F($size, $style = 'Regular') { New-Object System.Drawing.Font 'Microsoft JhengHei UI', $size, ([System.Drawing.FontStyle]$style), ([System.Drawing.GraphicsUnit]::Pixel) }
function B($hex) { New-Object System.Drawing.SolidBrush (C $hex) }
function RR($x, $y, $w, $h, $r, $fill, $stroke) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddArc($x, $y, 2*$r, 2*$r, 180, 90); $p.AddArc($x+$w-2*$r, $y, 2*$r, 2*$r, 270, 90)
  $p.AddArc($x+$w-2*$r, $y+$h-2*$r, 2*$r, 2*$r, 0, 90); $p.AddArc($x, $y+$h-2*$r, 2*$r, 2*$r, 90, 90); $p.CloseFigure()
  if ($fill) { $g.FillPath((B $fill), $p) }
  if ($stroke) { $g.DrawPath((New-Object System.Drawing.Pen (C $stroke), 2), $p) }
}

$g.Clear((C '#eef1f5'))
# top bar
$g.FillRectangle((B '#ffffff'), 0, 0, $W, 64)
$g.DrawLine((New-Object System.Drawing.Pen (C '#dde2ea'), 2), 0, 64, $W, 64)
$g.FillEllipse((B '#f5821f'), 32, 18, 28, 28)
$g.DrawString('Acme Cloud 主控台', (F 22 'Bold'), (B '#1f2733'), 72, 16)
$g.DrawString('專案　帳單　說明', (F 18), (B '#5b6675'), 820, 20)

# card
RR 60 100 1000 560 18 '#ffffff' '#dde2ea'
$g.DrawString('帳號設定', (F 34 'Bold'), (B '#1f2733'), 100, 130)
$g.DrawString('變更後請按「儲存變更」。', (F 18), (B '#6b7685'), 102, 184)

$rows = @(
  @('使用者名稱', 'Wang Xiao-Ming'),
  @('電子郵件', 'xiaoming.wang@example.com'),
  @('API 金鑰', 'sk-live-8f3K29xQaLm71ZpT0vRc'),
  @('密碼', 'Tg7!xq2#Lm-0429')
)
$ry = 240
foreach ($r in $rows) {
  $g.DrawString($r[0], (F 20), (B '#3a4555'), 100, $ry + 14)
  RR 300 $ry 700 56 10 '#f7f9fc' '#cfd6e0'
  $g.DrawString($r[1], (F 22), (B '#1f2733'), 318, $ry + 12)
  $ry += 80
}
RR 100 572 190 58 12 '#2b6fd6' $null
$g.DrawString('儲存變更', (F 22 'Bold'), (B '#ffffff'), 146, 586)
RR 306 572 140 58 12 '#ffffff' '#cfd6e0'
$g.DrawString('取消', (F 22), (B '#3a4555'), 352, 586)
$g.Dispose()
if ($Out) { $bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png) }

if ($Show) {
  $f = New-Object System.Windows.Forms.Form
  $f.FormBorderStyle = 'None'; $f.TopMost = $true; $f.ShowInTaskbar = $false
  $f.StartPosition = 'Manual'; $f.AutoScaleMode = 'None'
  $f.Location = New-Object System.Drawing.Point $X, $Y
  $f.ClientSize = New-Object System.Drawing.Size $W, $H
  $f.Text = 'RS-DEMO-IMAGE'
  $pb = New-Object System.Windows.Forms.PictureBox; $pb.Dock = 'Fill'; $pb.Image = $bmp; $f.Controls.Add($pb)
  $f.add_Shown({ [Dpi]::ShowWindow($f.Handle, 5) | Out-Null; $f.Activate() })
  [System.Windows.Forms.Application]::Run($f)
}
