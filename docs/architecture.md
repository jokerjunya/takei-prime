# Takei-prime アーキテクチャ設計書

## 1. システム全体構成

### 1.1 アーキテクチャ概要図

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │ Dashboard  │  │ Recommend  │  │ Admin      │              │
│  │ (Next.js)  │  │ UI         │  │ Panel      │              │
│  └────────────┘  └────────────┘  └────────────┘              │
└──────────────────────────────────────────────────────────────┘
                            ↓ HTTPS/REST API
┌──────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  FastAPI + Auth Middleware                           │    │
│  │  - JWT認証  - レート制限  - リクエストバリデーション    │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    Application Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Matching     │  │ Explanation  │  │ Analytics    │       │
│  │ Engine       │  │ Generator    │  │ Service      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Skill        │  │ Team         │  │ Candidate    │       │
│  │ Service      │  │ Service      │  │ Service      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                       ML/AI Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ FitScore     │  │ LLM          │  │ Embedding    │       │
│  │ Calculator   │  │ (GPT-4)      │  │ Model        │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                        Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ PostgreSQL   │  │ Vector DB    │  │ Redis        │       │
│  │ (Main DB)    │  │ (Pinecone)   │  │ (Cache)      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    External Integrations                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Indeed API   │  │ RMS API      │  │ HRMOS API    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. データモデル設計

### 2.1 ER図（主要エンティティ）

```
┌─────────────────┐
│   Candidate     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email           │
│ skills[]        │
│ personality     │◄──────┐
│ created_at      │       │
└─────────────────┘       │
                          │
                          │ Many-to-Many
┌─────────────────┐       │
│   Team          │       │
├─────────────────┤       │
│ id (PK)         │       │
│ name            │       │
│ department      │       │
│ culture_profile │       │
│ manager_id (FK) │       │
└─────────────────┘       │
        │                 │
        │                 │
        ▼                 │
┌─────────────────┐       │
│  TeamMember     │       │
├─────────────────┤       │
│ id (PK)         │       │
│ team_id (FK)    │       │
│ employee_id (FK)│       │
│ role            │       │
│ joined_at       │       │
└─────────────────┘       │
                          │
                          │
┌─────────────────┐       │
│   FitScore      │       │
├─────────────────┤       │
│ id (PK)         │───────┘
│ candidate_id(FK)│
│ team_id (FK)    │
│ total_score     │
│ skill_match     │
│ retention       │
│ friction        │
│ explanation     │
│ calculated_at   │
└─────────────────┘
```

### 2.2 主要テーブル定義

#### candidates (候補者)
```sql
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    current_position VARCHAR(255),
    years_of_experience INTEGER,
    education JSONB,
    personality_profile JSONB,  -- Big5等の性格特性
    work_style_preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_external_id ON candidates(external_id);
```

#### skills (スキル)
```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,  -- technical, soft, domain
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skills_category ON skills(category);
```

#### candidate_skills (候補者スキル)
```sql
CREATE TABLE candidate_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    years_of_experience DECIMAL(4,1),
    last_used_date DATE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, skill_id)
);

CREATE INDEX idx_candidate_skills_candidate ON candidate_skills(candidate_id);
CREATE INDEX idx_candidate_skills_skill ON candidate_skills(skill_id);
```

#### teams (チーム)
```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    description TEXT,
    manager_id UUID REFERENCES employees(id),
    culture_profile JSONB,  -- チーム文化特性
    size INTEGER,
    location VARCHAR(255),
    remote_policy VARCHAR(50),  -- full_remote, hybrid, onsite
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_department ON teams(department);
CREATE INDEX idx_teams_manager ON teams(manager_id);
```

#### team_requirements (チーム要求)
```sql
CREATE TABLE team_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    required_level INTEGER CHECK (required_level BETWEEN 1 AND 5),
    is_mandatory BOOLEAN DEFAULT FALSE,
    priority INTEGER,  -- 1: high, 2: medium, 3: low
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_team_requirements_team ON team_requirements(team_id);
```

#### fit_scores (Fitスコア)
```sql
CREATE TABLE fit_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    total_score DECIMAL(5,2) CHECK (total_score BETWEEN 0 AND 100),
    skill_match_score DECIMAL(5,2),
    retention_score DECIMAL(5,2),
    friction_score DECIMAL(5,2),
    strengths JSONB,
    risks JSONB,
    recommendations JSONB,
    explanation_text TEXT,
    model_version VARCHAR(50),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, team_id, calculated_at)
);

CREATE INDEX idx_fit_scores_candidate ON fit_scores(candidate_id);
CREATE INDEX idx_fit_scores_team ON fit_scores(team_id);
CREATE INDEX idx_fit_scores_total ON fit_scores(total_score DESC);
```

#### employees (社員)
```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255),
    position VARCHAR(255),
    hire_date DATE,
    personality_profile JSONB,
    performance_ratings JSONB,
    retention_risk_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
```

---

## 3. API設計

### 3.1 エンドポイント一覧

#### 認証
- `POST /api/v1/auth/login` - ログイン
- `POST /api/v1/auth/logout` - ログアウト
- `POST /api/v1/auth/refresh` - トークンリフレッシュ

#### 候補者管理
- `GET /api/v1/candidates` - 候補者一覧取得
- `POST /api/v1/candidates` - 候補者登録
- `GET /api/v1/candidates/{id}` - 候補者詳細取得
- `PUT /api/v1/candidates/{id}` - 候補者更新
- `DELETE /api/v1/candidates/{id}` - 候補者削除

#### チーム管理
- `GET /api/v1/teams` - チーム一覧取得
- `POST /api/v1/teams` - チーム登録
- `GET /api/v1/teams/{id}` - チーム詳細取得
- `PUT /api/v1/teams/{id}` - チーム更新

#### マッチング・レコメンド
- `POST /api/v1/matching/calculate` - Fitスコア計算
- `GET /api/v1/matching/recommendations` - レコメンド取得
- `GET /api/v1/matching/teams/{team_id}/candidates` - チームへの候補者推薦
- `GET /api/v1/matching/candidates/{candidate_id}/teams` - 候補者への配置推薦

#### 分析
- `GET /api/v1/analytics/team/{team_id}` - チーム分析
- `GET /api/v1/analytics/department/{dept_id}` - 部署分析
- `GET /api/v1/analytics/retention` - リテンション分析

### 3.2 サンプルAPI仕様

#### Fitスコア計算API

**リクエスト**
```json
POST /api/v1/matching/calculate
{
  "candidate_id": "123e4567-e89b-12d3-a456-426614174000",
  "team_id": "223e4567-e89b-12d3-a456-426614174001",
  "options": {
    "include_explanation": true,
    "detail_level": "full"  // basic, standard, full
  }
}
```

**レスポンス**
```json
{
  "fit_score": {
    "total": 78.5,
    "breakdown": {
      "skill_match": 82.3,
      "retention": 76.8,
      "friction": 15.2
    },
    "confidence": 0.85
  },
  "strengths": [
    {
      "aspect": "データ分析力",
      "score": 92,
      "description": "Pythonでの機械学習経験がチームのAI開発を加速"
    }
  ],
  "risks": [
    {
      "aspect": "コミュニケーション",
      "score": 45,
      "description": "リモートワーク主体のため、初期は発言タイミングが掴みにくい可能性"
    }
  ],
  "recommendations": [
    {
      "action": "週次1on1の設定",
      "priority": "high",
      "expected_impact": "定着率15%向上"
    }
  ],
  "explanation": "候補者Xは、チームAが必要とするPython/機械学習スキルを高水準で保有しており...",
  "calculated_at": "2025-10-26T10:30:00Z",
  "model_version": "v1.0.0"
}
```

---

## 4. Fitスコアアルゴリズム詳細

### 4.1 計算式

```python
# 総合スコア
FitScore = α × SkillMatch + β × Retention - γ × Friction

# 初期パラメータ
WEIGHTS = {
    "alpha": 0.40,   # スキルマッチ重み
    "beta": 0.35,    # リテンション重み
    "gamma": 0.25    # フリクション重み
}

# 正規化範囲: 0-100
```

### 4.2 SkillMatch計算

```python
def calculate_skill_match(candidate_skills, team_requirements):
    """
    スキルマッチスコアの計算
    
    Args:
        candidate_skills: List[{skill_id, level, experience}]
        team_requirements: List[{skill_id, required_level, is_mandatory, priority}]
    
    Returns:
        float: スキルマッチスコア (0-100)
    """
    
    # 1. 必須スキルチェック
    mandatory_skills = [req for req in team_requirements if req.is_mandatory]
    mandatory_match = check_mandatory_skills(candidate_skills, mandatory_skills)
    
    if not mandatory_match:
        return 0  # 必須スキル不足は即座に0点
    
    # 2. スキルレベルマッチング
    skill_scores = []
    for req in team_requirements:
        candidate_skill = find_skill(candidate_skills, req.skill_id)
        if candidate_skill:
            # レベル差に基づくスコア
            level_score = calculate_level_match(
                candidate_skill.level,
                req.required_level
            )
            # 経験年数ボーナス
            experience_bonus = min(candidate_skill.experience / 5.0, 1.0) * 10
            
            total = level_score + experience_bonus
            priority_weight = get_priority_weight(req.priority)
            skill_scores.append(total * priority_weight)
        else:
            # スキル不足ペナルティ
            skill_scores.append(0)
    
    # 3. 加重平均
    return weighted_average(skill_scores)


def calculate_level_match(candidate_level, required_level):
    """レベルマッチスコア計算"""
    diff = candidate_level - required_level
    
    if diff >= 0:
        # 要求以上のレベル
        return min(90 + diff * 5, 100)
    else:
        # 要求未満のレベル
        return max(0, 70 + diff * 20)
```

### 4.3 Retention計算

```python
def calculate_retention(candidate, team):
    """
    リテンションスコアの計算
    
    要素:
    - チーム文化適合性 (40%)
    - マネジメントスタイル適合性 (30%)
    - 価値観の一致 (20%)
    - ワークスタイル適合性 (10%)
    """
    
    # 1. チーム文化適合性 (Big5性格特性ベース)
    culture_fit = calculate_culture_fit(
        candidate.personality_profile,
        team.culture_profile
    )
    
    # 2. マネジメントスタイル適合性
    management_fit = calculate_management_fit(
        candidate.work_preferences,
        team.manager.management_style
    )
    
    # 3. 価値観の一致
    value_alignment = calculate_value_alignment(
        candidate.values,
        team.values
    )
    
    # 4. ワークスタイル適合性
    workstyle_fit = calculate_workstyle_fit(
        candidate.workstyle_preferences,
        team.workstyle
    )
    
    return (
        culture_fit * 0.40 +
        management_fit * 0.30 +
        value_alignment * 0.20 +
        workstyle_fit * 0.10
    )


def calculate_culture_fit(candidate_personality, team_culture):
    """
    Big5性格特性に基づく文化適合性
    
    Big5: Openness, Conscientiousness, Extraversion, 
          Agreeableness, Neuroticism
    """
    
    dimensions = ['openness', 'conscientiousness', 'extraversion', 
                  'agreeableness', 'neuroticism']
    
    fit_scores = []
    for dim in dimensions:
        candidate_score = candidate_personality.get(dim, 50)
        team_avg = team_culture.get(dim, 50)
        team_variance = team_culture.get(f"{dim}_variance", 15)
        
        # チーム平均との距離
        distance = abs(candidate_score - team_avg)
        
        # 許容範囲内かチェック
        if distance <= team_variance:
            fit_scores.append(100)
        else:
            # 距離に応じて減点
            penalty = (distance - team_variance) * 2
            fit_scores.append(max(0, 100 - penalty))
    
    return sum(fit_scores) / len(fit_scores)
```

### 4.4 Friction計算

```python
def calculate_friction(candidate, team, current_team=None):
    """
    フリクションスコアの計算（低いほど良い）
    
    要素:
    - オンボーディングコスト (40%)
    - コミュニケーションギャップ (30%)
    - ツール・プロセス習得コスト (20%)
    - 地理的・時差リスク (10%)
    """
    
    # 1. オンボーディングコスト
    onboarding_cost = calculate_onboarding_cost(
        candidate.experience,
        team.domain,
        team.tech_stack
    )
    
    # 2. コミュニケーションギャップ
    comm_gap = calculate_communication_gap(
        candidate.communication_style,
        team.communication_norms
    )
    
    # 3. ツール・プロセス習得コスト
    tool_learning_cost = calculate_tool_learning_cost(
        candidate.tool_experience,
        team.tools
    )
    
    # 4. 地理的・時差リスク
    geo_risk = calculate_geographic_risk(
        candidate.location,
        team.location,
        team.remote_policy
    )
    
    return (
        onboarding_cost * 0.40 +
        comm_gap * 0.30 +
        tool_learning_cost * 0.20 +
        geo_risk * 0.10
    )
```

---

## 5. LLM統合（説明生成）

### 5.1 プロンプト設計

```python
EXPLANATION_PROMPT = """
あなたは人事配置のエキスパートです。以下の情報を基に、候補者とチームの適合性を説明してください。

【候補者情報】
名前: {candidate_name}
スキル: {candidate_skills}
経験年数: {years_of_experience}
性格特性: {personality}

【チーム情報】
チーム名: {team_name}
必要スキル: {required_skills}
チーム文化: {team_culture}
現在の課題: {team_challenges}

【Fitスコア】
総合: {total_score}/100
スキルマッチ: {skill_match}/100
定着性: {retention}/100
摩擦: {friction}/100

以下の形式で出力してください:

🟢 強み (2-3点):
- [具体的な強みとその理由]

🟠 リスク (1-2点):
- [懸念点とその理由]

🔵 対策 (2-3点):
- [リスクを軽減する具体的なアクション]

【訴求メッセージ】
候補者に「なぜこのチームがあなたに最適か」を伝える100文字程度のメッセージ
"""
```

### 5.2 LangChain統合

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser

class ExplanationGenerator:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.7
        )
        self.parser = PydanticOutputParser(
            pydantic_object=FitExplanation
        )
    
    async def generate_explanation(
        self,
        candidate: Candidate,
        team: Team,
        fit_score: FitScore
    ) -> FitExplanation:
        """Fitスコアの説明を生成"""
        
        prompt = ChatPromptTemplate.from_template(
            EXPLANATION_PROMPT
        )
        
        chain = prompt | self.llm | self.parser
        
        result = await chain.ainvoke({
            "candidate_name": candidate.name,
            "candidate_skills": candidate.skills,
            "years_of_experience": candidate.years_of_experience,
            "personality": candidate.personality_profile,
            "team_name": team.name,
            "required_skills": team.requirements,
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

## 6. セキュリティ設計

### 6.1 認証・認可

```python
# JWT認証
- アクセストークン有効期限: 15分
- リフレッシュトークン有効期限: 7日
- アルゴリズム: RS256

# 権限レベル
ROLES = {
    "admin": ["*"],  # 全権限
    "hr_manager": ["read:all", "write:candidates", "write:teams"],
    "recruiter": ["read:candidates", "write:candidates", "read:scores"],
    "team_lead": ["read:own_team", "read:scores"],
    "viewer": ["read:dashboard"]
}
```

### 6.2 データ暗号化

- 保存時暗号化: AES-256
- 転送時暗号化: TLS 1.3
- 個人情報フィールド: フィールドレベル暗号化

### 6.3 監査ログ

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    action VARCHAR(100),  -- CREATE, READ, UPDATE, DELETE
    resource_type VARCHAR(100),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. パフォーマンス最適化

### 7.1 キャッシュ戦略

```python
# Redis キャッシュレイヤー
CACHE_KEYS = {
    "candidate:{id}": 3600,  # 1時間
    "team:{id}": 3600,
    "fit_score:{candidate_id}:{team_id}": 86400,  # 24時間
    "recommendations:{team_id}": 1800  # 30分
}
```

### 7.2 データベース最適化

- パーティショニング: fit_scoresを月次でパーティション
- インデックス最適化: 複合インデックス活用
- コネクションプーリング: 最大100接続

### 7.3 非同期処理

```python
# Celery タスク
- Fitスコア一括計算 (バッチ処理)
- データ同期 (外部API連携)
- レポート生成
- 埋め込みベクトル生成
```

---

**作成日**: 2025年10月26日  
**バージョン**: 1.0.0


