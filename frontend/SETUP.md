# 🚀 フロントエンド セットアップガイド

## クイックスタート（3ステップ）

### 1. 依存パッケージのインストール

```bash
cd /Users/01062544/Documents/takei-prime/frontend
npm install
```

以下のパッケージが自動インストールされます：

**主要パッケージ**:
- next@14.0.4
- react@18.2.0
- react-dom@18.2.0
- typescript@5.3.3

**UIライブラリ**:
- @radix-ui/react-select@2.0.0
- @radix-ui/react-tabs@1.0.4
- @radix-ui/react-tooltip@1.0.7
- @radix-ui/react-dialog@1.0.5
- @radix-ui/react-slot@1.0.2

**スタイリング**:
- tailwindcss@3.3.0
- class-variance-authority@0.7.0
- clsx@2.0.0
- tailwind-merge@2.1.0

**チャート**:
- recharts@2.10.3

**アイコン**:
- lucide-react@0.294.0

**状態管理**:
- zustand@4.4.7

### 2. 開発サーバー起動

```bash
npm run dev
```

起動ログ:
```
   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 1.8s
```

### 3. ブラウザで確認

http://localhost:3000 を開く

---

## 💡 初回起動時の確認事項

### ✅ データファイル確認

```bash
ls public/data/
```

以下のファイルが存在するか確認：
- `candidates.json`
- `teams.json`
- `skills_master.json`

### ✅ ビルド確認

```bash
npm run build
```

エラーがなければOK。

---

## 🎯 デモフロー

1. **トップページ** (`/`)
   - 「デモを見る」ボタンをクリック

2. **Fitスコア結果画面** (`/fit-score/result`)
   - 鈴木一郎 × AI/MLチームのデモ結果を確認
   - スコア、チャート、強み・リスク・対策を確認

3. **計算画面** (`/calculator`)
   - 候補者を選択（ドロップダウン）
   - チームを選択（ドロップダウン）
   - Preferenceモードを選択（5つのボタン）
   - 「Fitスコアを計算」をクリック
   - リアルタイムで結果表示

4. **詳細確認**
   - 「詳細な分析結果を見る」をクリック
   - 完全な分析レポートを確認

---

## 🐛 トラブルシューティング

### エラー: `Cannot find module`

```bash
rm -rf node_modules package-lock.json
npm install
```

### エラー: `Port 3000 is already in use`

```bash
# ポート変更
npm run dev -- -p 3001
```

### データが表示されない

```bash
# データファイルを再コピー
cp ../data/demo/*.json public/data/
```

### スタイルが反映されない

```bash
# キャッシュクリア
rm -rf .next
npm run dev
```

---

## 📦 ビルド・デプロイ

### 本番ビルド

```bash
npm run build
npm start
```

### Docker（今後実装予定）

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🎨 開発時のヒント

### ホットリロード
ファイル保存すると自動的に画面が更新されます。

### TypeScript型チェック
```bash
npx tsc --noEmit
```

### Lint
```bash
npm run lint
```

### フォーマット（今後追加予定）
```bash
npm run format
```

---

**準備完了！Happy Coding! 🚀**


