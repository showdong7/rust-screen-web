Add-Type -AssemblyName System.Drawing, System.Windows.Forms
if (-not ('Desk' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class Desk {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, int dx, int dy, int d, IntPtr e);
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, IntPtr e);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h, int x, int y, int w, int hh, bool repaint);
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, INPUT[] inputs, int size);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h, int attr, out RECT r, int size);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [StructLayout(LayoutKind.Sequential)] public struct KEYBDINPUT { public ushort vk; public ushort scan; public uint flags; public uint time; public IntPtr extra; }
  [StructLayout(LayoutKind.Sequential)] public struct MOUSEINPUT { public int dx, dy; public uint data, flags, time; public IntPtr extra; }
  [StructLayout(LayoutKind.Explicit)] public struct UNION { [FieldOffset(0)] public MOUSEINPUT mi; [FieldOffset(0)] public KEYBDINPUT ki; }
  [StructLayout(LayoutKind.Sequential)] public struct INPUT { public uint type; public UNION u; }
  public static RECT Frame(IntPtr h) { RECT r; if (DwmGetWindowAttribute(h, 9, out r, 16) != 0) GetWindowRect(h, out r); return r; }
  public static void TypeText(string s) {
    foreach (char c in s) {
      var a = new INPUT[2];
      a[0].type = 1; a[0].u.ki.scan = c; a[0].u.ki.flags = 4;
      a[1].type = 1; a[1].u.ki.scan = c; a[1].u.ki.flags = 4 | 2;
      SendInput(2, a, Marshal.SizeOf(typeof(INPUT)));
      System.Threading.Thread.Sleep(15);
    }
  }
}
'@
}
[void][Desk]::SetProcessDPIAware()
function Click($x, $y) { [Desk]::SetCursorPos($x, $y); Start-Sleep -m 80; [Desk]::mouse_event(2,0,0,0,0); Start-Sleep -m 60; [Desk]::mouse_event(4,0,0,0,0); Start-Sleep -m 250 }
function Drag($x0, $y0, $x1, $y1, $steps = 25) {
  [Desk]::SetCursorPos($x0, $y0); Start-Sleep -m 120; [Desk]::mouse_event(2,0,0,0,0); Start-Sleep -m 120
  for ($i = 1; $i -le $steps; $i++) { [Desk]::SetCursorPos([int]($x0 + ($x1-$x0)*$i/$steps), [int]($y0 + ($y1-$y0)*$i/$steps)); Start-Sleep -m 15 }
  Start-Sleep -m 120; [Desk]::mouse_event(4,0,0,0,0); Start-Sleep -m 300
}
function Key([byte[]]$vks) { foreach ($k in $vks) { [Desk]::keybd_event($k,0,0,0) ; Start-Sleep -m 30 }; [array]::Reverse($vks); foreach ($k in $vks) { [Desk]::keybd_event($k,0,2,0); Start-Sleep -m 30 } }
function Shot($x, $y, $w, $h, $path) {
  $b = New-Object System.Drawing.Bitmap $w, $h; $g = [System.Drawing.Graphics]::FromImage($b)
  $g.CopyFromScreen($x, $y, 0, 0, (New-Object System.Drawing.Size $w, $h)); $g.Dispose(); $b.Save($path, [System.Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
}
