# 截圖工具

重拍網站、README 與 Release 說明用的 App 截圖時使用。兩個腳本只控制本機桌面，不會連網。

| 檔案 | 用途 |
| --- | --- |
| `desk.ps1` | 以 dot-source 載入（`. .\tools\desk.ps1`），提供 `Click`、`Drag`、`Key`、`Shot` 函式與 `[Desk]` 型別（`Frame`、`MoveWindow`、`SetForegroundWindow`、`TypeText` 等）。會先呼叫 `SetProcessDPIAware`，所有座標都是實體像素。 |
| `demo.ps1` | 產生虛構的「Acme Cloud 帳號設定」示範頁（1120 × 700）。`-Out <png>` 存成圖片；`-Show -X <x> -Y <y>` 以無邊框、最上層視窗顯示，讓 Rust Screen 擷取。名稱、信箱、金鑰與密碼都是假資料。 |

需要 PowerShell 7（`pwsh`）。執行時會實際移動滑鼠、按鍵，約一分鐘內請勿操作電腦。

## 流程

以下座標是 1920 × 1200、縮放 125% 的螢幕，版面改變後請先用 `Shot 0 0 1920 1200 full.png` 截全螢幕確認位置。

1. 準備暫存設定資料夾，`settings.json` 設定：
   - `theme`：`dark`（之後再切淺色）
   - `watermark.enabled`：`false`；`auto_copy`：`false`（不動到剪貼簿）
   - 主視窗截圖：`edit_before_save` 為 `false`，`output_dir` 設為 `C:\Users\Public\Pictures\RustScreen`，狀態列與側欄路徑就不會出現使用者名稱；拍完刪除產生的 PNG 與資料夾。
   - 標註截圖：`edit_before_save` 為 `true`，不會寫入任何檔案。
2. 設定 `$env:RUST_SCREEN_CONFIG_DIR` 指向該資料夾，再啟動 `rust-screen.exe`，用 `[Desk]::MoveWindow($h, 160, 0, 1600, 1140, $true)` 固定視窗（DWM 外框為 168,0–1752,1132）。
3. 顯示示範頁：

   ```powershell
   Start-Process pwsh -ArgumentList '-NoProfile','-File','tools\demo.ps1','-Show','-X','560','-Y','250' -WindowStyle Hidden
   ```

4. 按「開始截圖」（約 343,507），或用設定中的快捷鍵，然後 `Drag 560 250 1680 950 40` 框選示範頁，再結束示範頁的程序。**先截全螢幕確認擷取到的是示範頁**；若示範頁沒出現，會擷取到自己的桌面。
5. 加上標註：先點工具列按鈕再 `Drag`。預覽中圖片座標換算為螢幕座標約為 `(610 + x × 0.935, 399 + y × 0.935)`。
   - 文字工具會開啟對話框：`[Desk]::TypeText('…')` 輸入後按「套用」。
   - 拍照前切回「選取」並點空白處，取消選取框與控制點，滑鼠移出畫面。
6. 截圖：
   - 主視窗：`Shot 168 0 1584 1132 main-dark.png`
   - 標註區：預覽面板（從「截圖預覽」標題到預覽框底部），目前為 1234 × 942。
7. 點右下角太陽圖示（約 1722,1094）切到淺色主題，標註會保留，用相同範圍再截一次。
8. 用 `Stop-Process` 結束 App，可略過「尚未儲存」的提示。

## 圖片放置位置

- 本 repo：`assets/shot-main-{dark,light}.png`、`assets/shot-annotate-{dark,light}.png`，並更新 `index.html` 的 `width`、`height` 與 `alt`。
- [rust-screen](https://github.com/showdong7/rust-screen) 與 rust-screen-app：`docs/screenshot-{main,annotate}-{dark,light}.png`，README 以 `<picture>` 依 GitHub 主題切換。
- Release 說明的圖片網址固定在發佈當時的 commit，不需要修改。
