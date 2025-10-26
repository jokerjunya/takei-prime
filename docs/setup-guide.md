# Takei-prime セットアップガイド

**対象**: 開発者、テスター  
**更新日**: 2025年10月26日

---

## 📋 目次

1. [開発環境要件](#1-開発環境要件)
2. [初回セットアップ](#2-初回セットアップ)
3. [ローカル開発](#3-ローカル開発)
4. [デモデータ投入](#4-デモデータ投入)
5. [デモ計算実行](#5-デモ計算実行)
6. [トラブルシューティング](#6-トラブルシューティング)

---

## 1. 開発環境要件

### 必須ツール

| ツール | バージョン | 確認コマンド |
|--------|-----------|-------------|
| **Python** | 3.11+ | `python --version` |
| **Node.js** | 20+ | `node --version` |
| **npm** | 10+ | `npm --version` |
| **Docker** | 24+ | `docker --version` |
| **Docker Compose** | 2.20+ | `docker-compose --version` |
| **Git** | 2.40+ | `git --version` |

### 推奨エディタ

- **VS Code** (推奨)
  - 拡張機能:
    - Python
    - Pylance
    - ESLint
    - Prettier
    - Docker
    - GitLens

- **PyCharm Professional** (代替)

---

## 2. 初回セットアップ

### Step 1: リポジトリクローン

```bash
git clone https://github.com/recruit-indeed/takei-prime.git
cd takei-prime
```

### Step 2: バックエンドセットアップ

```bash
cd backend

# 仮想環境作成
python -m venv venv

# 仮想環境有効化
# macOS/Linux:
source venv/bin/activate

# Windows:
# venv\Scripts\activate

# 依存パッケージインストール
pip install -r requirements.txt
pip install -r requirements-dev.txt  # 開発用パッケージ

# 環境変数設定
cp .env.example .env

# .envを編集（必要に応じて）
# vim .env
```

**requirements.txt（主要パッケージ）**:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
redis==5.0.1
celery==5.3.4
langchain==0.0.350
openai==1.3.0
scikit-learn==1.3.2
numpy==1.26.2
pandas==2.1.3
```

### Step 3: フロントエンドセットアップ

```bash
cd ../frontend

# 依存パッケージインストール
npm install

# 環境変数設定
cp .env.example .env.local

# .env.localを編集（必要に応じて）
```

**主要パッケージ**:
```json
{
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "@tanstack/react-query": "^5.12.2",
    "recharts": "^2.10.3",
    "zod": "^3.22.4",
    "react-hook-form": "^7.48.2"
  }
}
```

### Step 4: Dockerインフラ起動

```bash
cd ..  # プロジェクトルートに戻る

# PostgreSQL + Redis起動
docker-compose up -d

# 起動確認
docker-compose ps

# ログ確認
docker-compose logs -f
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: takei_prime
      POSTGRES_USER: takei_user
      POSTGRES_PASSWORD: takei_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Step 5: データベースマイグレーション

```bash
cd backend

# マイグレーション実行
alembic upgrade head

# マイグレーション確認
alembic current
```

---

## 3. ローカル開発

### ターミナル1: バックエンド起動

```bash
cd backend
source venv/bin/activate  # 仮想環境有効化

# 開発サーバー起動（ホットリロード有効）
uvicorn src.main:app --reload --port 8000

# または
python -m uvicorn src.main:app --reload --port 8000
```

**確認**: http://localhost:8000/docs （OpenAPI UI）

### ターミナル2: フロントエンド起動

```bash
cd frontend

# 開発サーバー起動
npm run dev
```

**確認**: http://localhost:3000

### ターミナル3: Celeryワーカー起動（オプション）

```bash
cd backend
source venv/bin/activate

# Celeryワーカー起動
celery -A src.tasks.celery_app worker --loglevel=info

# Celery Beat起動（定期タスク用）
celery -A src.tasks.celery_app beat --loglevel=info
```

---

## 4. デモデータ投入

### 方法1: Pythonスクリプト（推奨）

```bash
cd backend
source venv/bin/activate

# デモデータ投入
python scripts/seed_demo_data.py
```

**出力例**:
```
📁 デモデータをロード中...
✅ スキルマスター: 25件登録
✅ 候補者: 10人登録
✅ チーム: 10チーム登録
✨ デモデータ投入完了！
```

### 方法2: SQLファイル直接実行

```bash
# PostgreSQLコンテナに接続
docker exec -it takei-prime-postgres-1 psql -U takei_user -d takei_prime

# SQLファイル実行
\i /path/to/seed.sql

# 確認
SELECT COUNT(*) FROM candidates;
SELECT COUNT(*) FROM teams;
```

---

## 5. デモ計算実行

### Fitスコア計算デモ

```bash
cd scripts

# デモ計算実行
python demo_fit_score_calculation.py
```

**出力例**:
```
================================================================================
🎯 Fitスコア計算デモ
================================================================================

【候補者】: 鈴木 一郎
  職種: データサイエンティスト
  経験年数: 6年
  スキル数: 7個

【チーム】: AI/MLプロダクト開発チーム
  部署: プロダクト開発部
  チームサイズ: 8人
  リモートポリシー: hybrid
  平均稼働率: 75%

【経営方針モード】: STABILITY

--------------------------------------------------------------------------------

📊 【計算結果】
--------------------------------------------------------------------------------

総合Fitスコア: 82.5/100
  ├ SkillMatch  : 88.3/100
  ├ Retention   : 79.2/100
  ├ Friction    : 18.5/100
  └ 信頼度      : 0.93

📝 【SkillMatch詳細】
  ✅ Python: Lv5 / 要求Lv4 → スコア95.0
  ✅ 機械学習: Lv5 / 要求Lv4 → スコア95.0
  ✅ SQL: Lv4 / 要求Lv3 → スコア85.0

💼 【Retention詳細】
  ・性格類似度       : 85.2/100
  ・マネージャー適合性 : 50.0/100
  ・稼働率リスク     : 22.5/100 (低いほど良)
  ・異動直後リスク    : 0.0/100 (低いほど良)

⚡ 【Friction詳細】
  ・異動回数スコア    : 0.0/100
  ・引き継ぎ負荷     : 20.0/100
  ・上司交代スコア    : 0.0/100
  ・性格摩擦        : 14.8/100

💡 【解釈】
  ⭐️ 非常に高い適合性！この配置は成功確率が高いです。

🟢 【強み】
  ・必要なスキルを高水準で保有し、即戦力として活躍可能
  ・チーム文化に合う性格特性を持ち、長期的に定着しやすい

🟠 【リスク】
  (特になし)

🔵 【対策】
  (特になし)

================================================================================
```

---

## 6. トラブルシューティング

### 問題1: Pythonパッケージインストールエラー

**症状**:
```
ERROR: Could not build wheels for psycopg2
```

**解決策**:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install libpq-dev python3-dev

# Windows
# PostgreSQLインストーラーを使用
```

---

### 問題2: Dockerポート競合

**症状**:
```
Error starting userland proxy: listen tcp 0.0.0.0:5432: bind: address already in use
```

**解決策**:
```bash
# ポート使用状況確認
lsof -i :5432

# プロセスを停止するか、docker-compose.ymlのポートを変更
# ports:
#   - "5433:5432"  # ホスト側ポートを変更
```

---

### 問題3: データベース接続エラー

**症状**:
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**解決策**:
```bash
# PostgreSQL起動確認
docker-compose ps

# 再起動
docker-compose restart postgres

# 接続テスト
docker exec -it takei-prime-postgres-1 psql -U takei_user -d takei_prime -c "SELECT 1;"
```

---

### 問題4: npm install失敗

**症状**:
```
npm ERR! code EINTEGRITY
```

**解決策**:
```bash
# キャッシュクリア
npm cache clean --force

# node_modules削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

---

### 問題5: Alembicマイグレーションエラー

**症状**:
```
alembic.util.exc.CommandError: Target database is not up to date
```

**解決策**:
```bash
# 現在のリビジョン確認
alembic current

# マイグレーション履歴確認
alembic history

# 最新に更新
alembic upgrade head

# リセットが必要な場合
alembic downgrade base
alembic upgrade head
```

---

## 🔍 動作確認チェックリスト

### バックエンド

- [ ] `http://localhost:8000/docs` にアクセスできる
- [ ] OpenAPI UIでAPIが表示される
- [ ] Health checkエンドポイントが200を返す

```bash
curl http://localhost:8000/health
# {"status": "healthy"}
```

### フロントエンド

- [ ] `http://localhost:3000` にアクセスできる
- [ ] ホットリロードが動作する
- [ ] コンソールエラーがない

### データベース

- [ ] PostgreSQLに接続できる
- [ ] テーブルが作成されている

```bash
docker exec -it takei-prime-postgres-1 psql -U takei_user -d takei_prime -c "\dt"
```

### デモデータ

- [ ] 候補者データが登録されている
- [ ] チームデータが登録されている
- [ ] Fitスコア計算が実行できる

```bash
python scripts/demo_fit_score_calculation.py
```

---

## 📚 次のステップ

1. ✅ セットアップ完了
2. 📖 [開発計画書](development-plan-v2.md)を読む
3. 🎯 [完全設計ドキュメント](../takei_prime_full_spec.md)を理解する
4. 💻 コア機能の実装を開始
5. 🧪 テストを書く

---

## 🆘 サポート

問題が解決しない場合:

1. [Issues](https://github.com/recruit-indeed/takei-prime/issues)を確認
2. 新しいIssueを作成
3. チームSlackで質問

---

**Happy Coding! 🚀**


