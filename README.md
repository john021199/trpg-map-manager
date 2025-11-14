# TRPG Map Manager

一個本地化的 TRPG 地圖管理系統，使用 React + TypeScript 構建，支援視覺化地圖編輯、角色管理和地點連接。資料儲存於瀏覽器本地的 SQLite 資料庫（WASM 版本），可作為 PWA 應用使用。

![TRPG Map Manager](https://via.placeholder.com/800x400?text=TRPG+Map+Manager)

## 特色功能

### 🗺️ 地圖管理
- **Core 地點**：固定位置和連接，不會被隨機生成覆蓋
- **Outer 地點**：可隨機生成的外圍地點，適合製造隨機遭遇
- **視覺化編輯**：使用 React Flow 進行直觀的拖放式地圖編輯
- **自動連接生成**：根據參數自動生成地點之間的連接

### 👥 角色管理
- **多角色支持**：可建立多個角色，每個角色有獨特的名稱和顏色
- **位置追蹤**：記錄角色當前位置和移動歷史
- **歷史回放**：查看角色的移動軌跡

### 🎲 地圖生成
- **參數化生成**：設定外圍節點數量、平均連線數等參數
- **重置外圍**：保留 Core 地點，只重新生成 Outer 地點
- **圖論算法**：確保地圖連通性，支援有向/無向邊、環路控制

### 💾 資料管理
- **本地儲存**：使用 SQLite WASM 儲存於瀏覽器 localStorage
- **自動保存**：每 30 秒自動保存
- **匯入/匯出**：支援 JSON 格式的地圖資料匯入匯出
- **PWA 支持**：可離線使用，安裝為桌面應用

## 技術架構

### 前端技術棧
- **React 18** - UI 框架
- **TypeScript** - 類型安全
- **Vite** - 快速建構工具
- **React Flow** - 視覺化地圖編輯
- **Zustand** - 狀態管理
- **Tailwind CSS** - UI 樣式

### 資料層
- **sql.js** - SQLite WASM 版本
- **localStorage** - 持久化儲存

### PWA
- **vite-plugin-pwa** - PWA 配置
- **Workbox** - Service Worker 管理

## 快速開始

### 安裝依賴

```bash
cd trpg-map-manager
npm install
```

### 開發模式

```bash
npm run dev
```

應用將在 `http://localhost:5173` 啟動

### 建構生產版本

```bash
npm run build
```

建構產物將輸出到 `dist` 目錄

### 預覽生產版本

```bash
npm run preview
```

## 專案結構

```
trpg-map-manager/
├── src/
│   ├── components/          # React 組件
│   │   ├── map/            # 地圖相關組件
│   │   ├── locations/      # 地點管理組件
│   │   ├── characters/     # 角色管理組件
│   │   └── common/         # 共用組件
│   ├── services/           # 服務層
│   │   ├── database/       # 資料庫 CRUD 操作
│   │   └── mapGenerator/   # 地圖生成演算法
│   ├── stores/             # Zustand 狀態管理
│   ├── types/              # TypeScript 類型定義
│   └── App.tsx             # 主應用
├── public/                 # 靜態資源
└── vite.config.ts          # Vite 配置
```

## 資料庫結構

系統使用 SQLite 資料庫，包含以下表格：

- **locations** - 地點資訊（ID、名稱、類型、座標、描述）
- **connections** - 連接關係（來源、目標、有向性、權重）
- **characters** - 角色資訊（名稱、顏色、當前位置）
- **character_positions** - 角色位置歷史
- **map_settings** - 地圖生成參數設定

## 使用說明

### 建立地點

1. 點擊側邊欄的 "Locations" 面板
2. 點擊 "+ Add" 按鈕
3. 填寫地點資訊：
   - **名稱**：地點名稱
   - **類型**：Core（固定）或 Outer（隨機）
   - **座標**：地圖上的位置
   - **描述**：選填

### 建立角色

1. 點擊側邊欄的 "Characters" 面板
2. 點擊 "+ Add" 按鈕
3. 填寫角色資訊：
   - **名稱**：角色名稱
   - **顏色**：角色標記顏色
   - **初始位置**：選填
   - **描述**：選填

### 生成地圖

1. 點擊側邊欄的 "Settings" 面板
2. 調整生成參數：
   - **Outer Node Count**：外圍節點數量
   - **Average Degree**：平均連線數
   - **Show Grid**：顯示網格
   - **Allow Cycles**：允許環路
3. 點擊 "Generate Map" 按鈕

### 匯出/匯入地圖

- **匯出**：點擊頂部工具欄的 "Export" 按鈕，下載 JSON 檔案
- **匯入**：點擊 "Import" 按鈕，選擇之前匯出的 JSON 檔案

## 開發指南

### 新增地點類型

在 `src/types/index.ts` 中修改 `LocationType`：

```typescript
export type LocationType = 'core' | 'outer' | 'your-new-type';
```

### 自定義地圖生成演算法

修改 `src/services/mapGenerator/generator.ts` 中的生成邏輯。

### 新增資料庫表格

1. 在 `src/services/database/schema.ts` 中定義 SQL schema
2. 在 `src/services/database/` 中建立對應的 CRUD 服務
3. 在 `src/types/index.ts` 中定義 TypeScript 類型

## License

MIT

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 作者

Built with Claude Code
