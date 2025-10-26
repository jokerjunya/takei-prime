# Takei-prime Frontend

Next.js 14 (App Router) を使用したフロントエンドアプリケーション

## 🚀 クイックスタート

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 📁 実装済み画面

### ✅ Step 1: Fitスコア表示画面
- **URL**: `/fit-score/result`
- **機能**:
  - 総合Fitスコア表示（大きく目立つ）
  - SkillMatch/Retention/Frictionの内訳
  - レーダーチャート可視化
  - 強み・リスク・対策の表示
  - スコアに応じた色分け（優秀/良好/普通/要検討）

### ✅ Step 2: 計算画面
- **URL**: `/calculator`
- **機能**:
  - 候補者選択ドロップダウン（10人）
  - チーム選択ドロップダウン（10チーム）
  - Preferenceモード切り替え（5モード）
  - 「計算する」ボタン
  - リアルタイムスコア表示
  - 詳細画面への遷移

### ✅ Step 3: Preferenceモード切り替え
- **機能**:
  - Stability（離職最小化）
  - Growth（若手育成）
  - Diversity（多様性推進）
  - Priority（緊急PJ重視）
  - Innovation（異質補完）

## 🎨 使用技術

- **Next.js 14** (App Router)
- **TypeScript 5.3**
- **Tailwind CSS**
- **shadcn/ui** (UIコンポーネント)
- **Recharts** (チャート描画)
- **Lucide React** (アイコン)

## 📊 デモデータ

`public/data/` に以下のデータが配置されています：

- `candidates.json` - 候補者10人
- `teams.json` - チーム10チーム
- `skills_master.json` - スキルマスター25件

## 🧪 デモフロー

1. トップページ (`/`) から「デモを見る」をクリック
2. Fitスコア結果画面が表示される（鈴木一郎 × AI/MLチームのデモ）
3. 「計算画面に戻る」をクリック
4. 候補者・チーム・Preferenceモードを選択
5. 「Fitスコアを計算」をクリック
6. リアルタイムで計算結果が表示される
7. 「詳細な分析結果を見る」で詳細画面へ

## 📝 コンポーネント一覧

### Fitスコア表示系
- `ScoreCard` - スコアカード（数値表示）
- `ScoreChart` - レーダーチャート
- `StrengthsList` - 強み一覧
- `RisksList` - リスク一覧
- `RecommendationsList` - 対策一覧

### 基本UI
- `Button` - ボタン
- `Card` - カード
- `Select` - セレクトボックス

## 🎯 フィードバックポイント

### 確認すべき観点

#### ユーザビリティ
- [ ] 直感的に操作できるか
- [ ] 選択肢が分かりやすいか
- [ ] 計算結果が理解しやすいか

#### 情報設計
- [ ] 必要な情報が揃っているか
- [ ] 情報過多になっていないか
- [ ] スコアの意味が伝わるか

#### ビジネス価値
- [ ] 配置判断に役立つか
- [ ] 説得材料として使えるか
- [ ] 次のアクションが明確か

#### デザイン
- [ ] 色使いが適切か
- [ ] 文字サイズが読みやすいか
- [ ] レスポンシブ対応できているか

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Lint
npm run lint
```

## 📦 今後の実装予定

- [ ] Step 4: レコメンド一覧（複数チーム比較）
- [ ] Step 5: 候補者一覧
- [ ] Step 6: チーム一覧
- [ ] Step 7: ダッシュボード
- [ ] Step 8-9: データ管理（CRUD）

## 🐛 トラブルシューティング

### データが表示されない
→ `public/data/` にJSONファイルが配置されているか確認

### スタイルが反映されない
→ `npm install` を再度実行してから `npm run dev`

### ビルドエラー
→ TypeScriptの型エラーを確認（`npm run lint`）

---

**Happy Coding! 🎉**


