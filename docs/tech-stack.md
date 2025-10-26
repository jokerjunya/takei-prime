# Takei-prime 技術スタック詳細

**更新日**: 2025年10月26日

---

## 📚 目次

1. [フロントエンド](#1-フロントエンド)
2. [バックエンド](#2-バックエンド)
3. [データ層](#3-データ層)
4. [AI/ML](#4-aiml)
5. [インフラ](#5-インフラ)
6. [開発ツール](#6-開発ツール)
7. [外部連携](#7-外部連携)

---

## 1. フロントエンド

### Next.js 14+ (App Router)

**選定理由**:
- 2025年時点の最新安定版
- App Routerによる直感的なルーティング
- Server Components / Client Componentsの使い分けでパフォーマンス最適化
- ビルトインのISR/SSRでSEO対応

**バージョン**: 14.0+

**主要機能**:
```typescript
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const data = await fetchDashboardData()
  return <Dashboard data={data} />
}

// app/components/FitScoreChart.tsx (Client Component)
'use client'
export function FitScoreChart({ score }: Props) {
  return <Chart data={score} />
}
```

---

### TypeScript 5.3+

**選定理由**:
- 型安全性の確保
- IDEサポート充実
- リファクタリング容易
- バグの早期発見

**主要機能**:
```typescript
// 型定義例
interface FitScore {
  total: number
  skillMatch: number
  retention: number
  friction: number
  confidence: number
}

type PreferenceMode = 'stability' | 'growth' | 'diversity' | 'priority' | 'innovation'
```

---

### shadcn/ui + Tailwind CSS

**選定理由**:
- モダンで美しいUIコンポーネント
- アクセシビリティ対応済み
- カスタマイズ性が高い
- ダークモード対応

**主要コンポーネント**:
- Button, Card, Dialog, Table
- Form, Input, Select
- Chart (Recharts統合)
- Toast, Alert

**Tailwind設定**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          // ...
          900: '#0c4a6e',
        },
      },
    },
  },
}
```

---

### TanStack Query v5

**選定理由**:
- サーバーステート管理の標準
- 自動キャッシング、再検証
- オプティミスティックアップデート
- エラーハンドリング充実

**使用例**:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['fitScore', candidateId, teamId],
  queryFn: () => fetchFitScore(candidateId, teamId),
  staleTime: 5 * 60 * 1000, // 5分
})
```

---

### Recharts / D3.js

**選定理由**:
- Fitスコア可視化に最適
- React統合が容易
- レスポンシブ対応
- カスタマイズ性が高い

**使用例**:
```typescript
<RadarChart data={scoreData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="dimension" />
  <Radar name="Candidate" dataKey="score" />
</RadarChart>
```

---

### Zod + React Hook Form

**選定理由**:
- 型安全なバリデーション
- TypeScriptとの統合
- エラーメッセージ管理容易
- パフォーマンス最適化

**使用例**:
```typescript
const candidateSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  skills: z.array(z.object({
    skill_id: z.string(),
    proficiency_level: z.number().min(1).max(5),
  })),
})

type CandidateForm = z.infer<typeof candidateSchema>
```

---

## 2. バックエンド

### FastAPI (Python 3.11+)

**選定理由**:
- 高速（Node.js並み）
- 型ヒントによる自動バリデーション
- OpenAPI自動生成
- 非同期処理サポート

**バージョン**: 0.104+

**主要機能**:
```python
from fastapi import FastAPI, Depends
from pydantic import BaseModel

app = FastAPI()

class FitScoreRequest(BaseModel):
    candidate_id: str
    team_id: str
    preference_mode: PreferenceMode

@app.post("/api/v1/matching/calculate")
async def calculate_fit_score(
    request: FitScoreRequest,
    current_user: User = Depends(get_current_user)
):
    result = await fit_score_service.calculate(request)
    return result
```

---

### Pydantic v2

**選定理由**:
- データバリデーション
- シリアライゼーション
- 型安全性
- パフォーマンス向上（v2で大幅改善）

**使用例**:
```python
from pydantic import BaseModel, Field, validator

class Candidate(BaseModel):
    id: str
    name: str
    email: EmailStr
    skills: List[Skill]
    personality_profile: PersonalityProfile
    
    @validator('skills')
    def validate_skills(cls, v):
        if len(v) == 0:
            raise ValueError('少なくとも1つのスキルが必要です')
        return v
```

---

### LangChain

**選定理由**:
- LLM統合の標準フレームワーク
- プロンプト管理容易
- 複数LLMプロバイダー対応
- RAGサポート

**使用例**:
```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4-turbo-preview")
prompt = ChatPromptTemplate.from_template(EXPLANATION_PROMPT)

chain = prompt | llm | output_parser
result = await chain.ainvoke({"candidate": ..., "team": ...})
```

---

### Celery + Redis

**選定理由**:
- 分散タスクキュー
- 定期実行（Celery Beat）
- スケーラブル
- 信頼性が高い

**使用例**:
```python
from celery import Celery

app = Celery('takei_prime', broker='redis://localhost:6379/0')

@app.task
def calculate_fit_scores_batch(candidate_ids, team_ids):
    for candidate_id in candidate_ids:
        for team_id in team_ids:
            result = calculate_fit_score(candidate_id, team_id)
            store_result(result)
```

---

### scikit-learn

**選定理由**:
- 機械学習の標準ライブラリ
- コサイン類似度計算
- モデル学習・評価
- 成熟したライブラリ

**使用例**:
```python
from sklearn.metrics.pairwise import cosine_similarity

similarity = cosine_similarity(
    candidate_vector.reshape(1, -1),
    team_vector.reshape(1, -1)
)[0][0]
```

---

## 3. データ層

### PostgreSQL 16+

**選定理由**:
- ACID特性
- JSON/JSONBサポート
- pgvectorでベクトル検索
- エンタープライズグレード

**バージョン**: 16.0+

**主要機能**:
```sql
-- JSONBクエリ
SELECT * FROM candidates
WHERE personality_profile->>'openness' > '70';

-- pgvector類似度検索
SELECT skill_name, embedding <=> query_embedding AS distance
FROM skills
ORDER BY distance
LIMIT 10;
```

---

### pgvector

**選定理由**:
- PostgreSQL内でベクトル検索
- スキルマッチングに活用
- 管理が容易
- コスト効率が良い

**使用例**:
```sql
CREATE TABLE skill_embeddings (
    id UUID PRIMARY KEY,
    skill_name VARCHAR(255),
    embedding vector(1536)
);

CREATE INDEX ON skill_embeddings USING ivfflat (embedding vector_cosine_ops);
```

---

### Redis 7+

**選定理由**:
- 高速キャッシュ
- セッション管理
- タスクキュー（Celery）
- リアルタイム機能

**使用例**:
```python
import redis

redis_client = redis.Redis(host='localhost', port=6379)

# Fitスコアキャッシュ
redis_client.setex(
    f"fit_score:{candidate_id}:{team_id}",
    86400,  # 24時間
    json.dumps(fit_score_result)
)
```

---

### Pinecone / Qdrant

**選定理由**:
- 大規模ベクトル検索
- スキルマッチング最適化
- スケーラブル
- マネージド（Pinecone）/ セルフホスト（Qdrant）

**使用例（Pinecone）**:
```python
import pinecone

pinecone.init(api_key=PINECONE_API_KEY)
index = pinecone.Index("skills")

# スキル検索
results = index.query(
    vector=candidate_skill_vector,
    top_k=10,
    include_metadata=True
)
```

---

## 4. AI/ML

### OpenAI GPT-4 Turbo

**選定理由**:
- 高品質な説明生成
- 128k context window
- Function calling対応
- JSON mode対応

**使用例**:
```python
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

response = await client.chat.completions.create(
    model="gpt-4-turbo-preview",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.7,
    response_format={"type": "json_object"}
)
```

---

### text-embedding-3-large

**選定理由**:
- 高精度埋め込み（3072次元）
- スキルセマンティック検索
- コスト効率
- 多言語対応

**使用例**:
```python
response = await client.embeddings.create(
    model="text-embedding-3-large",
    input="Python, 機械学習, データ分析"
)

embedding = response.data[0].embedding  # 3072次元ベクトル
```

---

### MLflow

**選定理由**:
- ML実験管理
- モデルバージョニング
- メトリクス追跡
- モデルデプロイ

**使用例**:
```python
import mlflow

with mlflow.start_run():
    mlflow.log_param("alpha", 0.4)
    mlflow.log_param("beta", 0.35)
    mlflow.log_metric("accuracy", 0.85)
    mlflow.sklearn.log_model(model, "fit_score_model")
```

---

## 5. インフラ

### AWS

**主要サービス**:

| サービス | 用途 | 選定理由 |
|---------|------|---------|
| **ECS/Fargate** | コンテナ実行 | サーバーレス、スケーラブル |
| **RDS (PostgreSQL)** | メインDB | マネージド、自動バックアップ |
| **ElastiCache (Redis)** | キャッシュ | 高速、マネージド |
| **S3** | ファイルストレージ | 低コスト、高可用性 |
| **CloudFront** | CDN | 高速配信、DDoS対策 |
| **ALB** | ロードバランサ | L7負荷分散、SSL終端 |
| **CloudWatch** | モニタリング | ログ、メトリクス統合 |
| **Secrets Manager** | シークレット管理 | 暗号化、ローテーション |

---

### Docker

**選定理由**:
- 環境一貫性
- 開発・本番同一
- スケーリング容易
- CI/CD統合

**Dockerfile例**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### GitHub Actions

**選定理由**:
- GitHubネイティブ
- 豊富なアクション
- シークレット管理
- マトリックスビルド

**ワークフロー例**:
```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: pytest tests/
      
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS
        run: ./scripts/deploy.sh
```

---

## 6. 開発ツール

### テスト

| ツール | 用途 |
|--------|------|
| **pytest** | Pythonテスト |
| **Jest** | JavaScriptテスト |
| **Playwright** | E2Eテスト |
| **pytest-cov** | カバレッジ |

---

### リント・フォーマット

| ツール | 用途 |
|--------|------|
| **Ruff** | Python linter (超高速) |
| **Black** | Pythonフォーマッター |
| **ESLint** | TypeScript linter |
| **Prettier** | コードフォーマッター |

---

### 型チェック

| ツール | 用途 |
|--------|------|
| **mypy** | Python型チェック |
| **TypeScript** | 型チェック |

---

## 7. 外部連携

### Indeed API

**用途**: 候補者データ取得

**認証**: API Key

**主要エンドポイント**:
- `/candidates` - 候補者一覧
- `/applications` - 応募情報

---

### RMS API

**用途**: 社員データ同期

**認証**: OAuth 2.0

**主要エンドポイント**:
- `/employees` - 社員情報
- `/departments` - 組織情報

---

### HRMOS API

**用途**: 人事データ統合

**認証**: API Token

**主要エンドポイント**:
- `/performance` - 評価データ
- `/attendance` - 勤怠データ

---

## 📊 技術選定マトリックス

| 観点 | 優先度 | 選定基準 |
|------|--------|---------|
| **パフォーマンス** | 高 | 応答時間<300ms、同時接続1000+ |
| **スケーラビリティ** | 高 | 水平スケーリング容易 |
| **開発生産性** | 高 | 型安全、自動生成、豊富なライブラリ |
| **運用性** | 中 | モニタリング、ログ、エラー追跡 |
| **コスト** | 中 | ランニングコスト最適化 |
| **セキュリティ** | 高 | OWASP対応、暗号化、監査ログ |

---

## 🔄 技術更新方針

1. **LTS版優先**: 長期サポート版を選択
2. **定期アップデート**: 四半期ごとに依存関係更新
3. **段階的移行**: 破壊的変更は段階的に適用
4. **テストカバレッジ維持**: 80%以上を維持

---

**作成日**: 2025年10月26日  
**次回見直し**: 2026年1月26日


