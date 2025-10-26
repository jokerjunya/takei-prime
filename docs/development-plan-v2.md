# Takei-prime 開発計画書 v2.0

**作成日**: 2025年10月26日  
**ベース仕様**: takei_prime_full_spec.md  
**更新履歴**: full_spec反映版

---

## 📋 目次
1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック選定)
3. [コア機能設計](#3-コア機能設計)
4. [開発フェーズ](#4-開発フェーズ詳細)
5. [データ戦略](#5-データ戦略)
6. [リスク管理](#6-リスク管理)
7. [コスト見積](#7-コスト見積もり)
8. [KPI設計](#8-成功指標)

---

## 1. プロジェクト概要

### 1.1 ビジョン
> **「配置の科学化 × 人間の納得」**  
> 採用を超え、配置と組織運営そのものを再定義する。  
> 人が辞めない、チームが育つ。それを説明できるAIが、次世代のHRインフラになる。

### 1.2 提供価値
- **数値とストーリーの両立**: Fitスコア + 強み・リスク・対策の3層説明
- **経営方針への柔軟対応**: 5つのPreferenceプリセット
- **段階的最適化**: 個人→チーム→全社へ粒度を昇格
- **継続的学習**: 週次/月次/半期の3層更新サイクル

### 1.3 Recruit × Indeed の競争優位性
| 強み | 内容 |
|------|------|
| データ資産統合 | Indeed職務データ × リクルート社員データで社外⇄社内接続 |
| 文化適合性学習 | 日本型組織のチーム文化・心理安全性を学習できる唯一の基盤 |
| 配置→成果ループ | 採用→配置→定着→成果→学習の連続循環 |
| Explainable HR | 数値とストーリーで信頼を生む説明可能AI |

---

## 2. 技術スタック選定

### 2.1 フロントエンド
| 技術 | 選定理由 |
|------|---------|
| **Next.js 14+** (App Router) | SSR/ISRで高速UX、2025年標準 |
| **TypeScript 5.3+** | 型安全性の確保 |
| **shadcn/ui + Tailwind CSS** | モダンで美しいUI、高速開発 |
| **TanStack Query v5** | サーバーステート管理の標準 |
| **Recharts / D3.js** | Fitスコア可視化、チャート表示 |
| **React Hook Form + Zod** | 型安全なフォームバリデーション |

### 2.2 バックエンド
| 技術 | 選定理由 |
|------|---------|
| **FastAPI (Python 3.11+)** | 高速・型安全・OpenAPI自動生成 |
| **Pydantic v2** | データバリデーションと型安全性 |
| **LangChain** | LLM統合の標準フレームワーク |
| **Celery + Redis** | 非同期タスク処理（バッチ計算等） |
| **OpenAI GPT-4 Turbo** | 説明生成（強み→リスク→対策） |
| **scikit-learn** | Fitスコア計算、類似度算出 |

### 2.3 データ層
| 技術 | 用途 |
|------|------|
| **PostgreSQL 16+** | メインDB（候補者、チーム、スコア） |
| **pgvector** | スキルベクトル検索 |
| **Redis 7+** | キャッシュ、セッション、タスクキュー |
| **Pinecone / Qdrant** | 大規模ベクトル検索（スキルマッチング） |

### 2.4 インフラ・DevOps
| 技術 | 用途 |
|------|------|
| **AWS ECS/Fargate** | コンテナオーケストレーション |
| **Amazon RDS (PostgreSQL)** | マネージドDB |
| **ElastiCache (Redis)** | マネージドキャッシュ |
| **GitHub Actions** | CI/CD パイプライン |
| **Docker + Docker Compose** | ローカル開発環境 |
| **Datadog** | モニタリング・APM |

---

## 3. コア機能設計

### 3.1 Fitスコア計算エンジン

#### 基本公式
```
Fit = α × SkillMatch + β × Retention - γ × Friction
```

#### (1) SkillMatch の詳細

**計算要素:**
- 必須スキル vs 保有スキル（レベル1-5比較）
- スキル類似度（コサイン類似度）
- 不足スキル数による減点

**実装アルゴリズム:**
```python
def calculate_skill_match(candidate_skills, team_requirements):
    """
    スキルマッチスコア算出
    
    Returns: 0-100のスコア
    """
    # 1. 必須スキルチェック（必須が1つでも不足なら即0点）
    mandatory_check = all(
        has_skill(candidate_skills, req.skill_id) 
        for req in team_requirements if req.is_mandatory
    )
    if not mandatory_check:
        return 0
    
    # 2. レベル比較スコア
    level_scores = []
    for req in team_requirements:
        candidate_level = get_skill_level(candidate_skills, req.skill_id)
        required_level = req.required_level
        
        if candidate_level >= required_level:
            # 要求以上 → 90-100点
            score = 90 + min((candidate_level - required_level) * 5, 10)
        else:
            # 要求未満 → レベル差で減点
            score = max(0, 70 - (required_level - candidate_level) * 20)
        
        level_scores.append(score * req.priority_weight)
    
    # 3. 加重平均
    return weighted_average(level_scores)
```

**説明テンプレート:**
> 「チームにない{スキル名}を補い、{プロジェクト名}の成功率を高める」

#### (2) Retention の詳細

**計算公式:**
```
Retention = 0.4·PersonalitySim + 0.2·MgrSim + 0.2·(1−WorkloadRisk) + 0.2·(1−RecentMoveRisk)
```

**要素詳細:**

| 要素 | 説明 | 算出方法 |
|------|------|---------|
| **PersonalitySim** | Big Five類似度 | チーム平均とのコサイン類似度 |
| **MgrSim** | 上長との相性 | マネジメントスタイルマッチング |
| **WorkloadRisk** | 稼働率リスク | チーム平均稼働率（高いほどリスク） |
| **RecentMoveRisk** | 異動直後リスク | 直近3ヶ月以内の異動有無 |

**Big Five実装:**
```python
BIG_FIVE_DIMENSIONS = [
    'openness',          # 開放性
    'conscientiousness', # 誠実性
    'extraversion',      # 外向性
    'agreeableness',     # 協調性
    'neuroticism'        # 神経症傾向
]

def calculate_personality_similarity(candidate_profile, team_avg_profile):
    """
    Big Fiveベクトルのコサイン類似度を計算
    
    各次元は0-100のスコア
    """
    candidate_vec = [candidate_profile[dim] for dim in BIG_FIVE_DIMENSIONS]
    team_vec = [team_avg_profile[dim] for dim in BIG_FIVE_DIMENSIONS]
    
    # コサイン類似度
    similarity = cosine_similarity(candidate_vec, team_vec)
    
    # 0-100スケールに正規化
    return (similarity + 1) * 50  # [-1,1] → [0,100]
```

**説明テンプレート:**
> 「このチームはあなたの働き方に近く、継続して活躍できる」

#### (3) Friction の詳細

**計算公式:**
```
Friction = 0.35·MoveCount + 0.25·HandoverLoad + 0.2·ManagerChange + 0.2·(1−PersonalitySim)
```

**要素詳細:**

| 要素 | 説明 | 算出方法 |
|------|------|---------|
| **MoveCount** | 直近1年の異動回数 | 回数に応じた段階スコア |
| **HandoverLoad** | 引き継ぎ負荷 | 引き継ぎ人数・件数の重み付け |
| **ManagerChange** | 上司交代 | 交代有無（有:50, 無:0） |
| **PersonalitySim** | 文化摩擦 | 性格距離による摩擦予測 |

**説明テンプレート:**
> 「この配置には引き継ぎ負荷があるが、{対策}を取れば安定化できる」

---

### 3.2 Preferenceプリセット（経営方針モード）

企業の経営方針に応じて、Fitスコアの重みを調整する機能。

| モード | テーマ | α (Skill) | β (Retention) | γ (Friction) | 狙い |
|--------|--------|-----------|---------------|--------------|------|
| **Stability** | 離職最小化 | 0.4 | 0.5 | 0.1 | 安定重視配置 |
| **Growth** | 若手育成 | 0.6 | 0.2 | 0.2 | 成長・リスキル型 |
| **Diversity** | 多様性推進 | 0.4 | 0.4 | 0.2 | チーム構成多様化 |
| **Priority** | 緊急PJ重視 | 0.7 | 0.1 | 0.2 | 重点プロジェクト集中 |
| **Innovation** | 異質補完 | 0.5 | 0.3 | 0.2 | 新しい発想創出 |

**実装:**
```python
class PreferenceMode(Enum):
    STABILITY = "stability"
    GROWTH = "growth"
    DIVERSITY = "diversity"
    PRIORITY = "priority"
    INNOVATION = "innovation"

PREFERENCE_WEIGHTS = {
    PreferenceMode.STABILITY: {"alpha": 0.4, "beta": 0.5, "gamma": 0.1},
    PreferenceMode.GROWTH: {"alpha": 0.6, "beta": 0.2, "gamma": 0.2},
    PreferenceMode.DIVERSITY: {"alpha": 0.4, "beta": 0.4, "gamma": 0.2},
    PreferenceMode.PRIORITY: {"alpha": 0.7, "beta": 0.1, "gamma": 0.2},
    PreferenceMode.INNOVATION: {"alpha": 0.5, "beta": 0.3, "gamma": 0.2},
}

def calculate_fit_score(
    skill_match: float,
    retention: float,
    friction: float,
    preference_mode: PreferenceMode = PreferenceMode.STABILITY
) -> float:
    weights = PREFERENCE_WEIGHTS[preference_mode]
    
    fit = (
        weights["alpha"] * skill_match +
        weights["beta"] * retention -
        weights["gamma"] * friction
    )
    
    return max(0, min(100, fit))  # 0-100にクリップ
```

---

### 3.3 粒度昇格システム

データ成熟度に応じて、最適化の粒度を段階的に引き上げる。

| レベル | 条件 | 最適化単位 | 提供機能 |
|--------|------|-----------|---------|
| **個人最適** | データ充実度 < 60% | 候補者単位 | 基本的なFitスコア |
| **チーム最適** | チーム成熟度 ≥ 2.5、安定度 ≥ 70% | チーム構成単位 | チーム全体バランス提案 |
| **全社最適** | 全社平均成熟度 ≥ 3.5、更新3サイクル以上 | 組織全体 | 部署間最適配置 |

**データ成熟度の計算:**
```python
def calculate_data_maturity_level(candidate, team, organization):
    """
    データ成熟度レベルを判定
    
    Returns: 1-4のレベル
    """
    # L1: タグベースのみ
    if not candidate.skill_levels:
        return 1
    
    # L2: スキルレベル付き
    if not team.requirements or not team.culture_profile:
        return 2
    
    # L3: チーム要求定義あり
    if not organization.has_performance_data or not organization.has_retention_data:
        return 3
    
    # L4: 成果・離職連携
    return 4
```

---

### 3.4 訴求生成エンジン（LLM統合）

**構造: 強み → リスク → 対策**

```python
APPEAL_GENERATION_PROMPT = """
あなたは優秀な人事コンサルタントです。
以下の配置案について、「強み→リスク→対策」の3層構造で説明を生成してください。

【候補者情報】
名前: {candidate_name}
スキル: {candidate_skills}
性格特性 (Big Five): {personality}
経験年数: {years_of_experience}

【チーム情報】
チーム名: {team_name}
必要スキル: {required_skills}
チーム文化 (Big Five平均): {team_culture}
現在の課題: {team_challenges}

【Fitスコア】
総合: {total_score}/100
├ SkillMatch: {skill_match}/100
├ Retention: {retention}/100
└ Friction: {friction}/100

【出力形式】
🟢 強み (2-3点):
- [候補者がチームにもたらす具体的な価値]
- [チームの課題を解決できるポイント]

🟠 リスク (1-2点):
- [配置時に注意すべき懸念点]

🔵 対策 (2-3点):
- [リスクを軽減する具体的なアクション]
- [成功確率を高めるための施策]

【候補者への訴求メッセージ】
(100文字程度で、「なぜこのチームがあなたに最適か」を魅力的に伝える)

---

※ 人事・マネージャーがそのまま面談で使える言葉遣いにしてください。
※ 数値や抽象論ではなく、具体的な行動やシーンを想起させる表現を使ってください。
"""

async def generate_appeal(
    candidate: Candidate,
    team: Team,
    fit_score: FitScore
) -> AppealMessage:
    """LLMで訴求メッセージ生成"""
    
    llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.7)
    
    prompt = ChatPromptTemplate.from_template(APPEAL_GENERATION_PROMPT)
    parser = PydanticOutputParser(pydantic_object=AppealMessage)
    
    chain = prompt | llm | parser
    
    result = await chain.ainvoke({
        "candidate_name": candidate.name,
        "candidate_skills": format_skills(candidate.skills),
        "personality": candidate.personality_profile,
        "years_of_experience": candidate.years_of_experience,
        "team_name": team.name,
        "required_skills": format_requirements(team.requirements),
        "team_culture": team.culture_profile,
        "team_challenges": team.current_challenges,
        "total_score": fit_score.total_score,
        "skill_match": fit_score.skill_match_score,
        "retention": fit_score.retention_score,
        "friction": fit_score.friction_score
    })
    
    return result
```

---

### 3.5 更新サイクル（3層リズム）

> **「小さく動き、大きく確定する」**

| サイクル | 対象データ | 更新目的 | 実装方法 |
|---------|-----------|---------|---------|
| **週次** | 候補者・採用進捗 | 市場変動への即応 | Celeryタスク（毎週月曜朝） |
| **月次** | 社員・チーム構成 | 現場変化の反映 | 外部API連携（RMS/HRMOS） |
| **半期** | 成果・離職データ | モデル学習・重み再最適化 | MLflowパイプライン実行 |

**実装例:**
```python
# Celeryタスク定義
from celery import Celery
from celery.schedules import crontab

app = Celery('takei_prime')

@app.task
def weekly_candidate_update():
    """週次: 候補者データ更新"""
    sync_indeed_candidates()
    recalculate_active_fit_scores()
    notify_recruiters_of_changes()

@app.task
def monthly_employee_update():
    """月次: 社員・チーム更新"""
    sync_hrmos_employees()
    sync_rms_team_structure()
    update_team_culture_profiles()

@app.task
def biannual_model_retrain():
    """半期: モデル再学習"""
    collect_performance_data()
    collect_retention_data()
    retrain_fit_score_model()
    optimize_preference_weights()

# スケジュール設定
app.conf.beat_schedule = {
    'weekly-update': {
        'task': 'tasks.weekly_candidate_update',
        'schedule': crontab(hour=6, minute=0, day_of_week=1)  # 毎週月曜6時
    },
    'monthly-update': {
        'task': 'tasks.monthly_employee_update',
        'schedule': crontab(hour=3, minute=0, day_of_month=1)  # 毎月1日3時
    },
    'biannual-retrain': {
        'task': 'tasks.biannual_model_retrain',
        'schedule': crontab(hour=0, minute=0, day_of_month=1, month_of_year='1,7')  # 1月・7月1日
    }
}
```

---

## 4. 開発フェーズ詳細

### Phase 1: PoC開発（3ヶ月）

**目標**: 社内データで基本機能を検証し、MVP完成

#### Week 1-2: プロジェクトセットアップ
- [ ] リポジトリ構築（monorepo: frontend + backend）
- [ ] 開発環境構築（Docker Compose）
- [ ] CI/CDパイプライン（GitHub Actions）
- [ ] データベース設計・マイグレーション

#### Week 3-4: データモデル実装
- [ ] 候補者・社員テーブル実装
- [ ] チーム・要求テーブル実装
- [ ] Fitスコアテーブル実装
- [ ] Big Fiveデータ構造実装
- [ ] デモデータ投入（50候補者 × 10チーム）

#### Week 5-6: SkillMatch実装
- [ ] スキル類似度計算（コサイン類似度）
- [ ] レベル比較ロジック
- [ ] 必須スキルチェック
- [ ] 単体テスト（カバレッジ80%以上）

#### Week 7-8: Retention/Friction実装
- [ ] Big Five類似度計算
- [ ] マネージャー適合性計算
- [ ] WorkloadRisk/RecentMoveRisk実装
- [ ] Friction各要素実装
- [ ] 統合テスト

#### Week 9-10: Fitスコア統合・API実装
- [ ] 3軸統合計算エンジン
- [ ] Preferenceプリセット実装
- [ ] REST API実装（FastAPI）
- [ ] APIドキュメント生成（OpenAPI）

#### Week 11-12: 管理画面実装（MVP）
- [ ] 候補者一覧・詳細画面
- [ ] チーム管理画面
- [ ] Fitスコア表示画面
- [ ] Preferenceモード切替UI
- [ ] 社内検証（Recruit Agent）

**成果物:**
- 動作するMVP
- API仕様書
- テストカバレッジレポート
- 社内検証レポート

**KPI:**
- Fitスコア計算精度: 70%以上（人事評価との相関）
- API応答時間: 500ms以内
- データ入力完了率: 80%以上

---

### Phase 2: β版開発（4ヶ月）

**目標**: LLM統合、外部連携、データ成熟度L3達成

#### Month 1: LLM統合（訴求生成）
- [ ] LangChain統合
- [ ] プロンプトエンジニアリング
- [ ] 強み・リスク・対策生成機能
- [ ] 候補者訴求メッセージ生成
- [ ] 人間評価テスト（品質4/5以上）

#### Month 2: 外部システム連携
- [ ] Indeed API連携（候補者データ取得）
- [ ] RMS API連携（社員データ同期）
- [ ] HRMOS API連携（人事データ統合）
- [ ] データ同期スケジューラ実装
- [ ] エラーハンドリング・リトライ機構

#### Month 3: 高度な分析機能
- [ ] チーム文化分析ダッシュボード
- [ ] リテンション予測モデル
- [ ] 離職リスク検出
- [ ] 粒度昇格ロジック実装
- [ ] チーム最適化提案機能

#### Month 4: β版リリース準備
- [ ] セキュリティ監査（OWASP Top 10対応）
- [ ] パフォーマンスチューニング
- [ ] ロードテスト（1000ユーザー同時接続）
- [ ] ドキュメント整備
- [ ] β顧客への提供開始（5社）

**成果物:**
- β版プロダクト
- 外部連携ドキュメント
- セキュリティ監査レポート
- β顧客フィードバックレポート

**KPI:**
- Fitスコア精度: 85%以上
- 説明生成品質: 人間評価4/5以上
- API連携成功率: 99%以上
- β顧客満足度: NPS 30以上

---

### Phase 3: 本番展開（6ヶ月）

**目標**: 国内主要企業導入、スケーラビリティ確保、海外展開準備

#### Month 1-2: スケーリング対応
- [ ] マルチテナント実装
- [ ] データパーティショニング
- [ ] CDN導入（CloudFront）
- [ ] 大規模データ処理最適化（10万人規模対応）
- [ ] キャッシュ戦略強化

#### Month 3-4: エンタープライズ機能
- [ ] RBAC（Role-Based Access Control）強化
- [ ] 監査ログ完全実装
- [ ] カスタムレポート機能
- [ ] SSO対応（SAML 2.0）
- [ ] SOC2 Type II認証取得準備

#### Month 5-6: 本番リリース・展開
- [ ] 段階的ロールアウト（カナリアリリース）
- [ ] カスタマーサクセスチーム編成
- [ ] サポート体制構築（問い合わせ対応）
- [ ] 海外展開検証（英語版UI実装）
- [ ] 成果レポート作成

**成果物:**
- 本番プロダクト
- エンタープライズドキュメント
- カスタマーサクセスプレイブック
- 海外展開フィージビリティレポート

**KPI:**
- 導入企業数: 15社以上
- 月間アクティブユーザー: 2,000人以上
- 顧客満足度: NPS 40以上
- 離職率改善: 導入企業平均20%減
- 配置精度: 90%以上

---

## 5. データ戦略

### 5.1 データ成熟度モデル実装

| レベル | データ要件 | 出せる提案 | 実装フェーズ |
|--------|-----------|-----------|-------------|
| **L1** | タグベース | 相性傾向（ざっくり） | Phase 1 |
| **L2** | スキルレベル付き | 強み・補完説明 | Phase 1 |
| **L3** | チーム要求定義あり | 強み＋リスク＋対策 | Phase 2 |
| **L4** | 成果・離職連携 | モデル再学習・次期予測 | Phase 2-3 |

### 5.2 デモデータ設計

**候補者プロファイル（50人）:**
- 技術職: 30人（エンジニア、データサイエンティスト等）
- ビジネス職: 15人（セールス、マーケター等）
- バックオフィス: 5人（人事、経理等）

**チーム（10チーム）:**
- プロダクト開発: 4チーム
- セールス: 3チーム
- コーポレート: 3チーム

**Big Fiveデータ分布:**
- 平均値: 各次元50（標準偏差15）
- 多様性確保: 極端な値も一部含める

---

## 6. リスク管理

| リスク | 影響度 | 発生確率 | 対策 | 担当 |
|--------|--------|---------|------|------|
| AI精度不足 | 高 | 中 | 段階的リリース、人間レビュー併用 | ML Lead |
| データ品質問題 | 高 | 高 | データクレンジング自動化、入力検証強化 | Data Eng |
| 外部API障害 | 中 | 中 | フォールバック機構、キャッシュ活用 | Backend Lead |
| LLMコスト超過 | 中 | 中 | 使用量モニタリング、キャッシュ戦略 | PM |
| スケーラビリティ | 中 | 低 | クラウドネイティブ設計、負荷テスト | Infra Lead |
| セキュリティ侵害 | 高 | 低 | 定期的な脆弱性診断、SOC2対応 | Security |

---

## 7. コスト見積もり

### 7.1 開発コスト

| フェーズ | 期間 | 人件費 | インフラ | 外部費用 | 合計 |
|---------|------|--------|---------|---------|------|
| Phase 1 | 3ヶ月 | ¥11,400,000 | ¥900,000 | ¥500,000 | ¥12,800,000 |
| Phase 2 | 4ヶ月 | ¥18,000,000 | ¥1,600,000 | ¥1,000,000 | ¥20,600,000 |
| Phase 3 | 6ヶ月 | ¥24,000,000 | ¥3,000,000 | ¥2,000,000 | ¥29,000,000 |
| **合計** | **13ヶ月** | **¥53,400,000** | **¥5,500,000** | **¥3,500,000** | **¥62,400,000** |

### 7.2 ランニングコスト（月額）

| 項目 | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| AWS（ECS, RDS, ElastiCache等） | ¥200,000 | ¥400,000 | ¥800,000 |
| OpenAI API（GPT-4 Turbo） | ¥100,000 | ¥250,000 | ¥500,000 |
| Pinecone（ベクトルDB） | ¥50,000 | ¥100,000 | ¥200,000 |
| Datadog（モニタリング） | ¥50,000 | ¥80,000 | ¥150,000 |
| その他SaaS | ¥50,000 | ¥70,000 | ¥100,000 |
| **合計** | **¥450,000** | **¥900,000** | **¥1,750,000** |

---

## 8. 成功指標

### 8.1 プロダクトKPI

| 指標 | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| Fitスコア精度 | 70% | 85% | 90% |
| API応答時間 | <500ms | <300ms | <200ms |
| 説明生成品質 | 3.5/5 | 4.0/5 | 4.5/5 |
| データ成熟度 | L2 | L3 | L4 |
| システム稼働率 | 99% | 99.5% | 99.9% |

### 8.2 ビジネスKPI

| 指標 | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| 導入企業数 | 1社（社内） | 5社 | 15社 |
| MAU | 50 | 500 | 2,000 |
| 離職率改善 | - | 10%↓ | 20%↓ |
| 配置決定採用率 | 50% | 70% | 85% |
| NPS | - | 30 | 40 |

### 8.3 組織KPI（L4達成時）

| 指標 | 目標 |
|------|------|
| 3ヶ月定着率 | 95%以上 |
| 6ヶ月成果評価 | A評価30%以上 |
| チーム満足度 | 4.0/5以上 |
| 人事工数削減 | 30%削減 |

---

## 9. 次のアクション

### 即座に着手（Week 1）
1. ✅ 開発計画書作成（完了）
2. 🔲 リポジトリ作成・チーム編成
3. 🔲 デモデータ作成
4. 🔲 技術検証（LLM, ベクトルDB）

### Week 2-3
5. 🔲 データベーススキーマ実装
6. 🔲 開発環境構築
7. 🔲 CI/CDパイプライン構築
8. 🔲 MVP開発キックオフ

---

**策定者**: AI Development Team  
**レビュー**: (プロジェクトオーナー記入)  
**承認日**: (記入)  
**最終更新**: 2025年10月26日


