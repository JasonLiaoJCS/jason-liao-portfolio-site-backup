# 本機復原與重新發布說明

這個專案以本機檔案為完整來源，不依賴遠端資料庫或遠端物件儲存。即使目前的網站網域或託管服務停止使用，仍可由本機原始碼與公開資產重新建置及發布。

## 本機保留的內容

- `app/`、`components/`、`lib/`、`worker/`：網站程式碼、雙語內容、路由、互動與伺服器邏輯。
- `public/`：網站實際使用的圖片、PDF、影片預覽圖、CV、favicon 與社群分享圖。
- `lib/media-manifest.json`：公開媒體的路由、標題、替代文字、尺寸、頁數與 SHA-256 登錄。
- `package.json` 與 `package-lock.json`：固定的 JavaScript 套件與版本。
- `.openai/hosting.json`：Sites 專案識別與部署設定；沒有 D1 或 R2 遠端資料綁定。
- `dist/`：最近一次通過測試的可部署建置成品。
- `.dev.vars`：本機私密登入設定。此檔案刻意不加入 Git，也不可上傳或公開分享。
- 專案上一層的分類資料夾與 `00_先看這裡_網站資料說明/manifests/`：原始照片、文件、影片及其來源登錄。

網站目前的主要內容皆為檔案型資料。公開網站不使用必須另外匯出的資料庫，也沒有只存在託管平台、未存於本機的上傳檔案。

## 本機備份組合

日期版備份位於另一顆本機磁碟的 `D:\學術申請用網站_本機備份\`。每一版應包含：

1. `source-*.zip`：目前提交版本的完整原始碼與 437 個公開檔案。
2. `full-history-*.bundle`：完整 Git 版本歷史，可在沒有原遠端儲存庫時重新建立專案。
3. `deploy-build-*.tar.gz`：已建置的部署成品。
4. `dependencies-windows-*.tar.gz`：目前 Windows 環境可用的本機套件副本；一般情況仍建議依 `package-lock.json` 執行乾淨安裝。
5. 不對外分享的完整磁碟快照：保留 `.dev.vars` 與原始敏感資料，資料夾存取權限僅開放目前 Windows 使用者、系統與本機管理員。
6. `SHA256SUMS.txt`：上述備份檔案的完整性校驗值。

## 從原始碼重新發布

1. 解壓縮 `source-*.zip`，或使用 `full-history-*.bundle` 還原 Git 儲存庫。
2. 安裝 Node.js 22.13 或更新版本。
3. 在專案資料夾執行 `npm ci`。
4. 從受限制的完整快照取回 `.dev.vars`，並將其中兩個 `TRUSTED_*` 值重新設定到新的託管環境；不要把私密檔案放進 `public/`。
5. 若使用新網域，將 `SITE_URL` 與 `NEXT_PUBLIC_SITE_URL` 設為新網址，並更新 `scripts/build_public_course_record_pdf.py` 中的 PDF 網址後重新建置。
6. 執行 `npm test`；全部測試通過後再發布 `dist/`。

若無法連線至 npm 套件來源，可先還原 `dependencies-windows-*.tar.gz` 中的 `node_modules/`，再執行建置。這個依賴副本是 Windows／目前 Node.js 主要版本專用；跨作業系統時應依 `package-lock.json` 重新安裝。

## 外部連結的界線

- 網站圖片、PDF、文字、版面與影片預覽圖均在本機。
- 12 支影片的播放器使用 YouTube；其原始影片檔也保留在上一層的本機來源資料夾。若 YouTube 本身停止服務，網站可重新改為自架影片，但這不影響網站原始碼與其他內容的復原。
- GitHub 與 GPA 方法來源是公開外部連結，不是網站運作必需資料。
- 字型使用系統字型後備，不需要從遠端字型服務下載。

## 安全與備份原則

- `.dev.vars` 與完整磁碟快照永遠不可部署、提交或對外分享。
- 不要刪除 `public/`、`package-lock.json`、`lib/media-manifest.json` 或 `.openai/hosting.json`。
- 桌面上的原始資料可防止網域或遠端儲存庫失效；另外保存在不同本機磁碟的日期版快照可降低單一磁碟故障風險。
- 若還要防止整台電腦遺失，應再把備份複製到外接硬碟或另一個私人且加密的儲存位置。
