# Takei-prime 実装状況・今後のロードマップ

**更新日**: 2025年10月26日  
**現在の完成度**: 50% (4/8 UX体験)

---

## ✅ 実装完了（50%）

### 実装済みの画面・機能

| # | 機能 | URL | 完成度 | 確認 |
|---|------|-----|--------|------|
| 1 | ダッシュボード（組織図ビュー） | `/dashboard` | 95% | ✅ |
| 2 | 候補者一覧（Fitスコア棒グラフ） | `/candidates` | 90% | ✅ |
| 3 | 候補者詳細（Big Five分析） | `/candidates/[id]` | 90% | ✅ |
| 4 | チーム一覧 | `/teams` | 85% | ✅ |
| 5 | チーム詳細 | `/teams/[id]` | 70% | ✅ |
| 6 | Fitスコア計算 | `/calculator` | 90% | ✅ |
| 7 | Fitスコア結果表示 | `/fit-score/result` | 90% | ✅ |
| 8 | 配置シミュレーション（1対1） | `/simulation` | 95% | ✅ |
| 9 | **一括配置シミュレーション** | `/batch-simulation` | 90% | ✅ |

**実装済み**: 9画面

---

## 🔄 UXビジョンとの照合

### UXビジョンの8つの体験

| # | 体験 | 実装状況 | 完成度 | 優先度 |
|---|------|---------|-------|--------|
| 1 | ログイン画面 | ❌ 未実装 | 0% | 🟢 低 |
| 2 | ホーム画面（組織ビュー） | ✅ **完成** | 95% | - |
| 3 | 採用候補タブ | ✅ **完成** | 90% | - |
| 4 | 配置シミュレーション | ✅ **完成** | 95% | - |
| 4b | **一括配置シミュレーション** | ✅ **完成** | 90% | - |
| 5 | 候補者訴求生成 | ❌ 未実装 | 0% | 🟡 中 |
| 6 | チーム分析タブ | 🟡 部分実装 | 70% | 🟡 中 |
| 7 | 保存と共有 | ❌ 未実装 | 0% | 🟢 低 |
| 8 | 自動更新通知 | ❌ 未実装 | 0% | 🟢 低 |

**完成済み**: 4/8 (50%)  
**部分実装**: 1/8 (12.5%)  
**未実装**: 3/8 (37.5%)

---

## 🎯 次に実装すべき機能（優先順位順）

### 🔴 Priority 1: 応募職種フィルタリング（1-2日）⭐⭐⭐⭐⭐

**なぜ重要か**:
> ユーザーからのフィードバック:  
> 「エンジニアは人事チームには行かない。関係ないチームのFitは意味がない」

**現在の問題**:
- 全候補者 × 全43チームのFitスコアを計算
- エンジニア候補者に人事・経理チームとのFitも表示される

**実装内容**:
```typescript
// データ追加
interface Candidate {
  target_role: 'engineer' | 'sales' | 'marketing' | 'design' | 'corporate' | 'operations'
  target_department?: string  // 希望部署（任意）
}

interface Team {
  recruiting_positions: Array<{
    role: string
    level: 'junior' | 'mid' | 'senior'
    count: number
  }>
}

// フィルタリング
function getRelevantTeams(candidate: Candidate, allTeams: Team[]): Team[] {
  return allTeams.filter(team =>
    team.recruiting_positions.some(pos => pos.role === candidate.target_role)
  )
}
```

**影響範囲**:
- `data/demo/candidates.json` - target_role追加
- `data/demo/teams.json` - recruiting_positions追加
- `lib/data.ts` - フィルタリング関数追加
- `app/candidates/page.tsx` - 関連チームのみ表示
- `app/batch-simulation/page.tsx` - 関連チームのみで配置

**ビジネス価値**: ⭐⭐⭐⭐⭐（最重要）

---

### 🟡 Priority 2: チーム分析の強化（1-2日）⭐⭐⭐⭐

**不足している要素**:

#### A. バランス指数の表示強化
- 現在: シミュレーションで計算のみ
- 必要: チーム詳細ページに常時表示
- 実装: `/teams/[id]` に追加

#### B. スキル分布チャート
```
チームのスキルカバレッジ

Python    ████████████░░░░ 75%  (4/5人保有)
React     ██████░░░░░░░░░░ 40%  (2/5人保有)
AWS       ████████░░░░░░░░ 50%  (2.5/5人保有)
```

#### C. メンバー構成の可視化
- 現在のメンバー一覧（デモ: 3-5人表示）
- Big Five分布（散布図）
- スキルマトリックス

**影響範囲**:
- `app/teams/[id]/page.tsx` - チーム詳細の拡張
- `components/team/TeamAnalysis.tsx` - 新規作成
- `components/team/SkillDistribution.tsx` - 新規作成
- `components/team/MemberList.tsx` - 新規作成

**ビジネス価値**: ⭐⭐⭐⭐

---

### 🟡 Priority 3: LLM統合 - 候補者訴求生成（1-2日）⭐⭐⭐⭐

**UXビジョン**:
> 「この提案を候補者に伝える」ボタンを押すと、AIが自動で説明文を生成

**実装内容**:
```typescript
// バックエンド（Next.js API Route）
// app/api/generate-appeal/route.ts

import OpenAI from 'openai'

export async function POST(request: Request) {
  const { candidate, team, fitScore } = await request.json()
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  const prompt = `
あなたは優秀な人事コンサルタントです。

候補者: ${candidate.name}
チーム: ${team.name}
Fitスコア: ${fitScore}/100

候補者に「なぜこのチームがあなたに最適か」を
心理的に訴求する100文字のメッセージを生成してください。
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  })
  
  return Response.json({ message: response.choices[0].message.content })
}
```

**UI追加箇所**:
- Fitスコア結果ページ（`/fit-score/result`）
- 候補者詳細ページ（`/candidates/[id]`）
- 一括配置結果

**必要な設定**:
- `.env.local` に `OPENAI_API_KEY` 追加
- OpenAI パッケージインストール

**ビジネス価値**: ⭐⭐⭐⭐

---

### 🟢 Priority 4: バックエンドAPI実装（3-5日）⭐⭐⭐

**現状の課題**:
- 全てフロントエンドで計算（ブラウザに負荷）
- データ永続化なし（リロードで消える）
- 提案の保存ができない

**実装内容**:

#### A. FastAPI セットアップ
```python
# backend/src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/matching/calculate")
async def calculate_fit_score(request: FitScoreRequest):
    # Fitスコア計算
    pass
```

#### B. PostgreSQL セットアップ
- Docker Composeでローカル環境
- Alembicでマイグレーション
- テーブル: candidates, teams, fit_scores, proposals

#### C. API実装
- Fitスコア計算API
- 一括配置API
- 提案保存API
- 履歴取得API

**影響範囲**:
- `backend/` ディレクトリ全体
- `frontend/lib/api.ts` - APIクライアント
- `docker-compose.yml` - PostgreSQL追加

**ビジネス価値**: ⭐⭐⭐

---

### 🟢 Priority 5: 提案の保存・履歴機能（2-3日）⭐⭐

**実装内容**:
- 配置提案の保存
- 提案履歴一覧（`/proposals`）
- ステータス管理（決定/保留/再検討）
- フィルター・検索

**前提**: Priority 4（バックエンドAPI）が必要

**ビジネス価値**: ⭐⭐

---

### 🟢 Priority 6: Slack/Teams連携（1-2日）⭐⭐

**実装内容**:
- Slack Webhook統合
- 提案共有機能
- 通知機能

**前提**: Priority 5（提案保存）が必要

**ビジネス価値**: ⭐⭐

---

### 🟢 Priority 7: 認証機能（1-2日）⭐

**実装内容**:
- Auth0 / Firebase Authentication
- ログイン画面
- ユーザー管理

**ビジネス価値**: ⭐

---

## 📅 推奨実装スケジュール

### Week 1（最重要）
**Day 1-2**: 🔴 **応募職種フィルタリング**
- エンジニアには関連チームのみ表示
- 実務的な精度向上

### Week 2（重要）
**Day 3-5**: 🟡 **チーム分析強化**
- バランス指数常時表示
- スキル分布チャート
- メンバー構成可視化

**Day 6-7**: 🟡 **LLM統合（訴求生成）**
- OpenAI API統合
- 訴求メッセージ自動生成

### Week 3-4（基盤整備）
**Day 8-12**: 🟢 **バックエンドAPI + DB**
- FastAPI実装
- PostgreSQL接続
- API化

**Day 13-15**: 🟢 **提案保存・履歴**
- CRUD実装
- 履歴一覧ページ

### Week 5以降（拡張）
- Slack連携
- 認証機能
- 管理画面

---

## 🎯 即座に開発すべきもの（Top 3）

### 1位: 🔴 応募職種フィルタリング
**理由**: ユーザーからの直接フィードバック、実用性が大幅向上  
**所要時間**: 1-2日  
**価値**: ⭐⭐⭐⭐⭐

### 2位: 🟡 チーム分析強化
**理由**: チーム詳細ページの情報が薄い、分析深度を上げる  
**所要時間**: 1-2日  
**価値**: ⭐⭐⭐⭐

### 3位: 🟡 LLM統合（訴求生成）
**理由**: 「説明できるAI」の真骨頂、インパクト大  
**所要時間**: 1-2日  
**価値**: ⭐⭐⭐⭐

---

## 📊 現在の実装状況

### データ
- ✅ 13部署
- ✅ 43チーム
- ✅ 50候補者
- ✅ 149既存従業員
- ✅ 25スキル
- ❌ 応募職種情報（未設定）
- ❌ 募集ポジション情報（未設定）

### 機能
- ✅ Fitスコア計算（3軸統合）
- ✅ Preferenceプリセット（5モード）
- ✅ Big Five性格分析
- ✅ 組織図ビュー
- ✅ 候補者分析（Fitスコア棒グラフ）
- ✅ 配置シミュレーション（1対1）
- ✅ 一括配置シミュレーション（多対多）
- ✅ 玉突き異動検討
- ❌ 応募職種フィルタリング
- ❌ LLM訴求生成
- ❌ 提案保存
- ❌ バックエンドAPI

### インフラ
- ✅ Next.js 14 (フロントエンド)
- ✅ TypeScript
- ✅ Tailwind CSS + shadcn/ui
- ✅ Recharts
- ❌ FastAPI（バックエンド）
- ❌ PostgreSQL
- ❌ OpenAI API

---

## 💡 推奨される次のアクション

### 即座に着手すべき（Week 1）

#### 📌 応募職種フィルタリング実装

**Task 1**: データ追加（0.5日）
- `candidates.json` に `target_role` 追加（50人分）
- `teams.json` に `recruiting_positions` 追加（43チーム分）

**Task 2**: フィルタリングロジック（0.5日）
- `lib/data.ts` に `getRelevantTeamsForCandidate()` 追加
- `lib/batch-assignment.ts` でフィルタリング適用

**Task 3**: UI更新（0.5-1日）
- 候補者一覧: 関連チームのみ表示
- 一括配置: 関連チームのみで計算
- 候補者詳細: 「応募職種」バッジ表示

**成果物**:
- エンジニア候補者 → 開発チームのみ表示
- セールス候補者 → 営業チームのみ表示
- より実務的で意味のある分析

---

### Week 2: チーム分析 + LLM統合

#### チーム分析強化
- バランス指数を全チーム詳細に表示
- スキル分布チャート
- メンバー一覧

#### LLM訴求生成
- OpenAI API統合
- 訴求メッセージ生成
- コピー・共有機能

---

## 📈 完成度の推移

```
Phase 1 (MVP): 20%完成
  ↓
Phase 2 (ホーム): 35%完成
  ↓
Phase 3 (候補者・チーム): 44%完成
  ↓
Phase 4 (シミュレーション): 50%完成 ← 今ここ
  ↓
Phase 5 (応募職種フィルタ): 60%完成（予定）
  ↓
Phase 6 (LLM統合): 70%完成（予定）
  ↓
Phase 7 (バックエンド): 85%完成（予定）
  ↓
Phase 8 (本番リリース): 100%完成
```

---

## 🎊 今日の開発成果（振り返り）

### 開発時間: 約7-8時間

### 実装したもの
1. ✅ 組織図ビュー（階層構造）
2. ✅ 候補者一覧（Fitスコア棒グラフ）
3. ✅ Big Five性格分析
4. ✅ 配置シミュレーション（Before/After）
5. ✅ 一括配置シミュレーション（玉突き異動）
6. ✅ 149人の既存従業員データ生成

### 成果物
- **82ファイル**
- **33,000+行のコード**
- **9画面実装**
- **620人の組織データ**

### GitHubコミット
- 4コミット
- https://github.com/jokerjunya/takei-prime

---

## 🚀 次のアクションプラン

### 推奨: 応募職種フィルタリングを実装

**理由**:
1. ユーザーからの直接フィードバック
2. 実務的な精度が大幅向上
3. 1-2日で完成可能
4. 他の機能にも好影響

**実装すると**:
- エンジニア候補者には開発チームのみ表示
- セールス候補者には営業チームのみ表示
- Fitスコア比較が意味のあるものに
- 一括配置の精度向上

---

**次は応募職種フィルタリングの実装を推奨します！** 🎯

---

**更新日**: 2025年10月26日  
**Next Action**: 応募職種フィルタリング実装

