# 🐰 Notebbit (激動兔筆記)

Notebbit 是一款結合了**知識管理**、**日常紀錄**與**遊戲化目標達成**的全新筆記應用。透過我們精心設計的「激動兔」夥伴陪伴，讓枯燥的筆記與繁瑣的任務變得更加有趣與充滿動力！無論是建立學習筆記、撰寫生活日記，還是設定每日挑戰，Notebbit 都能成為您最佳的個人成長助理。

---

## ✨ 亮點功能 (Key Features)

### 📝 1. 全方位文檔與日記管理 (Rich Editor)
- **雙模式編輯器**：專為不同情境打造的「文件」與「日記」專屬編輯環境。
- **強大富文本 (Rich Text)**：不只是一般的文字框！支援豐富的文字排版、待辦清單，並能輕鬆插入圖片，打造精美的排版。
- **資料來源儲存 (Data Source)**：在文件中標記重點並關聯外部資料來源，幫助您建立完善的個人知識庫。
- **標籤系統**：自訂標籤 (Tags) 功能，讓文件分類與搜尋更加直觀有效率。

### ⏳ 2. 內建版本控制 (Version Control)
- **自動化與手動存檔**：不用擔心寫錯或誤刪！隨時儲存檔案版本。
- **時光機回退**：一鍵預覽並回退到特定的歷史版本，找回靈感無負擔。

### 🎮 3. 遊戲化任務系統 (Gamified Tasks)
- **自訂每日任務**：為自己設定專屬的每日目標。
- **經驗值與升級機制**：完成任務獲取經驗值 (Exp)，看著「激動兔」跟隨您的努力逐漸升級！
- **視覺化進度條**：直觀的經驗值與等級進度條，每天都能感受到成長的喜悅。

### ☁️ 4. 雲端同步與 Local-First 體驗 (Cloud Sync & Local-First)
- **Local-First 架構**：採用樂觀 UI 更新 (Optimistic Updates)，操作反應極致流暢，不必等待網路轉圈圈。
- **多裝置無縫同步**：整合 Supabase 雲端資料庫，背景自動同步，確保您的筆記與等級永遠不會遺失。
- **安全登入**：支援 Google OAuth 與一般信箱註冊登入。

### 📥 5. 本地檔案匯入
- **無縫接軌**：支援從手機匯入 `.txt` 甚至是 `.docx` 檔案，自動轉換為 Notebbit 文件繼續編輯。

### 🗑️ 6. 資源回收站防呆機制
- 不小心刪除筆記？別擔心，刪除的檔案會進入回收站，讓你有機會一鍵「還原」或是「永久刪除」。

---

## 🛠️ 使用技術與架構 (Tech Stack & Architecture)

本專案採用現代化的前端技術棧與嚴謹的軟體架構，確保應用的可擴展性、效能與易維護性。

### 核心技術
- **[React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)**：使用 Expo 框架進行跨平台 (iOS/Android) 應用程式開發。
- **[Expo Router](https://docs.expo.dev/router/introduction/)**：以文件系統為基礎 (File-based Routing) 的導航系統。
- **[Zustand](https://github.com/pmndrs/zustand)**：輕量、快速且純粹的狀態管理工具。
- **[Supabase](https://supabase.com/)**：開源的 Firebase 替代方案，提供 PostgreSQL 資料庫、身分驗證 (Auth) 以及行級安全防護 (RLS)。

### 架構設計 (Architecture)
為了讓應用程式具備企業級的維護性，本專案採用了 **Service-Hook-Store** 的三層架構分離模式：

```text
📦 Notebbit_app
 ┣ 📂 app          # 頁面路由 (Expo Router)
 ┣ 📂 components   # 共用的 UI 元件
 ┣ 📂 constants    # 全域常數與 Supabase 初始化
 ┣ 📂 hooks        # 封裝業務邏輯與狀態操作 (useAuthActions...)
 ┣ 📂 services     # 負責對外 API 請求與資料庫溝通 (authService...)
 ┣ 📂 store        # Zustand 全域狀態中心
 ┗ 📂 styles       # 共用樣式與設計系統 Token
```

1. **Store 層 (Zustand)**：退化為純粹的狀態容器 (Pure State Container)，不牽涉任何非同步邏輯。
2. **Service 層**：專責處理所有的外部 API 請求與 Supabase 互動 (`authService`, `fileService`, `taskService`)。
3. **Hook 層**：作為 UI 與後端的橋樑 (`useAuthActions`, `useFileActions`, `useTaskActions`)，封裝了複雜的業務邏輯與副作用，讓 UI 元件保持絕對的乾淨。

### UI 與設計套件
- **[Lucide React Native](https://lucide.dev/)**：一致且美觀的開源 Icon 系統。
- **客製化 Design System**：不依賴龐大的 UI 框架，專案內建高度模組化的 `styles` 與 `constants` Token 系統，確保深淺色與主題色調的絕對統一。

### 其他實用工具
- `expo-document-picker` & `expo-file-system`：處理本地檔案選取與讀寫。
- `mammoth`：強大的工具，用於將 `.docx` 檔案精準轉換為 HTML 格式匯入編輯器。
- `expo-crypto`：生成安全的 UUID 等加密需求。

---

## 🚀 如何開始 (給開發者 - Local Development)

> **💡 註**：如果您是一般使用者，未來可以直接下載我們透過 Expo EAS 發布的 App 版本，不需進行下列開發設定即可直接登入使用！

如果您是開發者，想在本地端運行此專案：

1. **安裝依賴**：
   ```bash
   npm install
   ```
2. **環境變數設定**：
   因為安全性考量，專案的 `.env` 檔案（包含資料庫金鑰）不會上傳至 GitHub。您需要在根目錄新增 `.env` 檔案，並填入您的 Supabase 資訊才能在本機連線：
   ```env
   EXPO_PUBLIC_SUPABASE_URL=你的_SUPABASE_URL
   EXPO_PUBLIC_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY
   ```

3. **Supabase 資料庫與 OAuth 設定**：
   - **資料表建立**：請確保在您的 Supabase 中建立對應的 `user_profiles`, `files`, `tasks` 等資料表，並設定正確的 Row Level Security (RLS) 規則。
   - **Google 登入設定**：若要測試 Google 登入，請至 Supabase Dashboard 的 Authentication -> Providers 中啟用 Google，並將 Expo 的重新導向網址（如 `exp://127.0.0.1:19000/--/expo-auth-session`）加入到 Supabase 的 Redirect URLs 白名單中。

4. **啟動專案**：
   ```bash
   npx expo start
   ```
   您可以掃描終端機上的 QR Code，使用 **Expo Go** 在實體手機上預覽，或是開啟 iOS/Android 模擬器執行。

5. **發布與打包 (EAS Build)**：
   若要自行打包發布 APK 或 iOS 檔案，請確保安裝 `eas-cli`：
   ```bash
   npm install -g eas-cli
   eas login
   eas build --profile preview
   ```

> *"記錄生活，完成挑戰，和激動兔一起成長吧！"* 🐰✨
