# Takei-prime

**「説明できるAI」で"人が辞めない組織設計"を実現する配置レコメンドシステム**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.3+-blue.svg)](https://www.typescriptlang.org/)

---

## 📖 概要

Takei-primeは、スキル・性格・チーム文化を統合的に分析し、最適な人材配置を提案するAIレコメンドシステムです。

### コア価値

```
Fit = α × SkillMatch + β × Retention - γ × Friction
```

- **SkillMatch**: スキル・経験の一致度 → 成果が出る配置
- **Retention**: チーム文化・上司との相性 → 長く働ける配置
- **Friction**: 異動・引継ぎ・文化差リスク → リスクを対策付きで説明

### 提供機能

| 機能 | 説明 |
|------|------|
| **Fitスコア算出** | 候補者×チームの相性を数値化 |
| **強み→リスク→対策生成** | 配置案を"語れる説明"に変換 |
| **Preferenceプリセット** | 経営方針に応じた重み調整（5モード） |
| **粒度昇格** | 個人→チーム→全社の段階的最適化 |
| **自動更新サイクル** | 週次/月次/半期の3層リズム |

---

## 🚀 クイックスタート

### 前提条件

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+
- Redis 7+

### ローカル開発環境セットアップ

```bash
# リポジトリクローン
git clone https://github.com/recruit-indeed/takei-prime.git
cd takei-prime

# バックエンドセットアップ
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# フロントエンドセットアップ
cd ../frontend
npm install

# Docker Composeでインフラ起動
cd ..
docker-compose up -d

# データベースマイグレーション
cd backend
alembic upgrade head

# デモデータ投入
python scripts/seed_demo_data.py

# 開発サーバー起動
# ターミナル1: バックエンド
cd backend
uvicorn src.main:app --reload --port 8000

# ターミナル2: フロントエンド
cd frontend
npm run dev
```

ブラウザで http://localhost:3000 を開く

---

## 📁 プロジェクト構造

```
takei-prime/
├── backend/                    # FastAPI バックエンド
│   ├── src/
│   │   ├── core/              # コアロジック
│   │   │   ├── fit_score_calculator.py  # Fitスコア計算エンジン
│   │   │   ├── explanation_generator.py # LLM説明生成
│   │   │   └── preference_engine.py     # Preferenceプリセット
│   │   ├── api/               # REST API
│   │   │   ├── v1/
│   │   │   │   ├── candidates.py
│   │   │   │   ├── teams.py
│   │   │   │   └── matching.py
│   │   ├── models/            # データモデル
│   │   ├── services/          # ビジネスロジック
│   │   └── utils/             # ユーティリティ
│   ├── tests/                 # テスト
│   ├── alembic/               # DBマイグレーション
│   └── requirements.txt
│
├── frontend/                   # Next.js フロントエンド
│   ├── app/                   # App Router
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── candidates/        # 候補者管理
│   │   ├── teams/             # チーム管理
│   │   └── recommendations/   # レコメンド表示
│   ├── components/            # UIコンポーネント
│   ├── lib/                   # ユーティリティ
│   └── package.json
│
├── data/                      # データ
│   ├── demo/                  # デモデータ
│   │   ├── candidates.json
│   │   ├── teams.json
│   │   └── skills_master.json
│   └── migrations/            # データ移行スクリプト
│
├── docs/                      # ドキュメント
│   ├── development-plan-v2.md # 開発計画書
│   ├── architecture.md        # アーキテクチャ設計
│   └── api/                   # API仕様書
│
├── scripts/                   # スクリプト
│   ├── seed_demo_data.py      # デモデータ投入
│   └── setup_dev.sh           # 開発環境セットアップ
│
├── docker-compose.yml         # Docker設定
├── .env.example               # 環境変数テンプレート
└── README.md
```

---

## 🎯 使用例

### 1. Fitスコア計算

```python
from src.core.fit_score_calculator import (
    FitScoreEngine,
    PreferenceMode,
    Skill,
    TeamRequirement,
    PersonalityProfile
)

# 候補者データ
candidate_skills = [
    Skill("sk_001", proficiency_level=5, years_of_experience=7.5),  # Python
    Skill("sk_007", proficiency_level=4, years_of_experience=4.0),  # 機械学習
]

candidate_personality = PersonalityProfile(
    openness=75,
    conscientiousness=80,
    extraversion=45,
    agreeableness=60,
    neuroticism=35
)

# チームデータ
team_requirements = [
    TeamRequirement("sk_001", required_level=4, is_mandatory=True, priority=1),
    TeamRequirement("sk_007", required_level=4, is_mandatory=True, priority=1),
]

team_culture = PersonalityProfile(
    openness=80,
    conscientiousness=75,
    extraversion=50,
    agreeableness=65,
    neuroticism=40
)

# Fitスコア計算（Stabilityモード：離職最小化）
engine = FitScoreEngine(PreferenceMode.STABILITY)
result = engine.calculate_fit_score(
    candidate_skills=candidate_skills,
    team_requirements=team_requirements,
    candidate_personality=candidate_personality,
    team_culture=team_culture,
    workload_rate=75.0
)

print(f"総合Fitスコア: {result.total_score}/100")
print(f"├ SkillMatch: {result.skill_match_score}/100")
print(f"├ Retention: {result.retention_score}/100")
print(f"└ Friction: {result.friction_score}/100")
```

### 2. REST API使用

```bash
# Fitスコア計算API
curl -X POST http://localhost:8000/api/v1/matching/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": "cand_001",
    "team_id": "team_001",
    "preference_mode": "stability"
  }'

# レスポンス例
{
  "fit_score": {
    "total": 78.5,
    "skill_match": 82.3,
    "retention": 76.8,
    "friction": 15.2,
    "confidence": 0.85
  },
  "strengths": [
    {
      "aspect": "データ分析力",
      "score": 92,
      "description": "Pythonでの機械学習経験がチームのAI開発を加速"
    }
  ],
  "risks": [...],
  "recommendations": [...]
}
```

---

## 🧪 テスト

```bash
# バックエンド単体テスト
cd backend
pytest tests/ -v --cov=src --cov-report=html

# フロントエンドテスト
cd frontend
npm run test

# E2Eテスト
npm run test:e2e
```

---

## 📊 デモデータ

プロジェクトには、すぐに試せるデモデータが含まれています：

- **候補者**: 10人（エンジニア、セールス、デザイナー等）
- **チーム**: 10チーム（AI/ML開発、フロントエンド、セールス等）
- **スキル**: 25スキル（技術、ソフトスキル、ドメイン知識）

各候補者にはBig Five性格特性、スキルレベル、経験年数が設定されています。

### デモデータ投入

```bash
python scripts/seed_demo_data.py
```

---

## 🔧 設定

### 環境変数

`.env.example`をコピーして`.env`を作成：

```bash
cp .env.example .env
```

主要な設定項目：

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/takei_prime

# Redis
REDIS_URL=redis://localhost:6379/0

# OpenAI (説明生成用)
OPENAI_API_KEY=sk-...

# Pinecone (ベクトル検索用)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...

# 外部連携
INDEED_API_KEY=...
RMS_API_KEY=...
HRMOS_API_KEY=...
```

---

## 📈 開発フェーズ

### Phase 1: PoC (3ヶ月) - 現在のフェーズ

- [x] 開発計画書作成
- [x] プロジェクト構造構築
- [x] Fitスコア計算エンジン実装
- [x] デモデータ作成
- [ ] REST API実装
- [ ] 管理画面実装（MVP）
- [ ] 社内検証

### Phase 2: β版 (4ヶ月)

- [ ] LLM統合（説明生成）
- [ ] 外部システム連携（Indeed/RMS/HRMOS）
- [ ] 高度な分析機能
- [ ] β版リリース

### Phase 3: 本番展開 (6ヶ月)

- [ ] スケーリング対応
- [ ] エンタープライズ機能
- [ ] 本番リリース・導入支援

詳細は [docs/development-plan-v2.md](docs/development-plan-v2.md) を参照。

---

## 🤝 コントリビューション

コントリビューションを歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

コミットメッセージは [Conventional Commits](https://www.conventionalcommits.org/) 形式で記述してください。

---

## 📝 ドキュメント

- [開発計画書](docs/development-plan-v2.md)
- [アーキテクチャ設計](docs/architecture.md)
- [完全設計ドキュメント](takei_prime_full_spec.md)
- [API仕様書](docs/api/) (自動生成: http://localhost:8000/docs)

---

## 🌟 Recruit × Indeed の強み

| 強み | 内容 |
|------|------|
| データ資産統合 | Indeed職務データ × リクルート社員データで社外⇄社内接続 |
| 文化適合性学習 | 日本型組織のチーム文化・心理安全性を学習できる唯一の基盤 |
| 配置→成果ループ | 採用→配置→定着→成果→学習の連続循環 |
| Explainable HR | 数値とストーリーで信頼を生む説明可能AI |

---

## 📜 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

---

## 👥 チーム

- **プロダクトオーナー**: (記入)
- **テックリード**: (記入)
- **ML/AIリード**: (記入)

---

## 📧 お問い合わせ

質問や提案がある場合は、[Issues](https://github.com/recruit-indeed/takei-prime/issues) を作成してください。

---

**Takei-prime = "配置の科学化 × 人間の納得"**

採用を超え、配置と組織運営そのものを再定義する。  
人が辞めない、チームが育つ。  
それを説明できるAIが、次世代のHRインフラになる。


