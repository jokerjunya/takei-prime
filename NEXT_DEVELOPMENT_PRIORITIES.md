# 🎯 次の開発優先順位

**作成日**: 2025年10月26日  
**現在の完成度**: 35% (3/8機能)

---

## 📊 実装状況（スクリーンショット確認済み）

### ✅ 実装完了（35%）

| 機能 | 完成度 | 確認結果 |
|------|-------|---------|
| **組織図ビュー** | 95% | ✅ 美しく階層表示、展開/折りたたみ動作 |
| **候補者一覧** | 90% | ✅ Fitスコア棒グラフが秀逸、AIインサイト表示 |
| **候補者詳細** | 90% | ✅ Big Fiveレーダーチャート、スキル可視化 |
| **チーム詳細** | 60% | 🟡 基本情報はOK、分析機能が不足 |

**スクリーンショット**:
- `dashboard-organization-view.png` - 組織図
- `candidates-list-view.png` - 候補者一覧（Fitスコア棒グラフ）
- `candidate-detail-bigfive.png` - Big Five分析

---

## 🚀 次に開発すべき機能（優先順位順）

### 🔴 Priority 1: 配置シミュレーション（最重要）⭐⭐⭐⭐⭐

**なぜ最重要か**:
> 「試しに『候補者Aを追加』→『チーム再計算』をクリック。  
> チームの外向性が+5pt、安定性が-2ptに変化。  
> → ここで初めて『この人とこのチームの化学反応』が見える。」

**これがTakei-primeの核心価値！**

#### 実装内容

**ページ**: `/simulation`

**画面構成**:
```
┌─────────────────────────────────────────────────┐
│ 配置シミュレーション                             │
├─────────────────────────────────────────────────┤
│ [候補者を選択] [チームを選択] [シミュレーション実行]│
├─────────────────────────────────────────────────┤
│                                                 │
│ 【現在のチーム構成】    【候補者追加後】         │
│ ┌─────────────┐       ┌─────────────┐         │
│ │Big Five       │       │Big Five       │         │
│ │レーダーチャート│       │レーダーチャート│         │
│ │               │       │               │         │
│ │外向性: 65     │       │外向性: 70 (+5)│         │
│ │誠実性: 78     │       │誠実性: 76 (-2)│         │
│ │開放性: 72     │       │開放性: 75 (+3)│         │
│ └─────────────┘       └─────────────┘         │
│                                                 │
│ バランス指数: 72        バランス指数: 68 (-4)   │
│                                                 │
│ 💡 AIによる影響分析                              │
│ ┌───────────────────────────────────────┐     │
│ │🟢 強み                                 │     │
│ │・アイデア創出力が15%向上               │     │
│ │・データドリブンな意思決定が強化        │     │
│ │                                        │     │
│ │🟠 リスク                               │     │
│ │・初期の摩擦が予想される（-4pt）        │     │
│ │・コミュニケーションギャップの可能性    │     │
│ │                                        │     │
│ │🔵 対策                                 │     │
│ │・1on1頻度を週1→週2に調整              │     │
│ │・最初の1ヶ月はペアワークを推奨         │     │
│ │・予想定着率: 85%                       │     │
│ └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

#### 技術実装

**1. Big Five変化計算**:
```typescript
function simulateTeamWithCandidate(
  team: Team,
  currentMembers: Employee[], // 現在のメンバー
  candidate: Candidate
): {
  before: PersonalityProfile,
  after: PersonalityProfile,
  diff: PersonalityProfile
} {
  // 現在の平均
  const before = calculateTeamAverage(currentMembers)
  
  // 候補者追加後の平均
  const after = calculateTeamAverage([...currentMembers, candidate])
  
  // 差分
  const diff = {
    openness: after.openness - before.openness,
    conscientiousness: after.conscientiousness - before.conscientiousness,
    extraversion: after.extraversion - before.extraversion,
    agreeableness: after.agreeableness - before.agreeableness,
    neuroticism: after.neuroticism - before.neuroticism
  }
  
  return { before, after, diff }
}
```

**2. バランス指数計算**:
```typescript
function calculateBalanceIndex(members: PersonalityProfile[]): number {
  // Big Five各次元の標準偏差を計算
  const stdDevs = BIG_FIVE_DIMENSIONS.map(dim => {
    const values = members.map(m => m[dim])
    return calculateStdDev(values)
  })
  
  // 平均標準偏差
  const avgStdDev = stdDevs.reduce((sum, sd) => sum + sd, 0) / stdDevs.length
  
  // 0-100スケールに正規化（標準偏差が小さいほど高スコア）
  const balance = 100 - (avgStdDev / 20) * 100
  
  return Math.max(0, Math.min(100, balance))
}
```

**3. 影響分析ロジック**:
```typescript
function analyzeImpact(before: PersonalityProfile, after: PersonalityProfile) {
  const strengths = []
  const risks = []
  const actions = []
  
  // 開放性の増加 → アイデア創出
  if (after.openness - before.openness > 3) {
    strengths.push('アイデア創出力が向上')
  }
  
  // 外向性の減少 → コミュニケーションリスク
  if (after.extraversion - before.extraversion < -3) {
    risks.push('コミュニケーションギャップの可能性')
    actions.push('1on1頻度を増やす')
  }
  
  return { strengths, risks, actions }
}
```

**所要時間**: 2-3日  
**ビジネス価値**: ⭐⭐⭐⭐⭐

---

### 🟡 Priority 2: 候補者訴求生成

**実装内容**:

**1. OpenAI API統合**:
```typescript
// lib/llm.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateAppealMessage(
  candidate: Candidate,
  team: Team,
  fitScore: FitScoreResult
): Promise<string> {
  const prompt = `
あなたは優秀な人事コンサルタントです。

【候補者】
名前: ${candidate.name}
職種: ${candidate.current_position}
スキル: ${candidate.skills.map(s => s.skill_id).join(', ')}
性格特性: 開放性${candidate.personality_profile.openness}...

【チーム】
名前: ${team.name}
課題: ${team.current_challenges.join(', ')}

【Fitスコア】
総合: ${fitScore.total_score}/100
スキルマッチ: ${fitScore.breakdown.skill_match}/100

候補者に「なぜこのチームがあなたに最適か」を
心理的に訴求する100文字のメッセージを生成してください。
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 200
  })
  
  return response.choices[0].message.content || ''
}
```

**2. UI実装**:
```typescript
// components/fit-score/AppealGenerator.tsx
export function AppealGenerator({ candidate, team, fitScore }) {
  const [appeal, setAppeal] = useState('')
  const [generating, setGenerating] = useState(false)
  
  const handleGenerate = async () => {
    setGenerating(true)
    const message = await generateAppealMessage(candidate, team, fitScore)
    setAppeal(message)
    setGenerating(false)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>候補者への訴求メッセージ</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? '生成中...' : '訴求を生成'}
        </Button>
        
        {appeal && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
            <p>{appeal}</p>
            <Button variant="outline" size="sm" className="mt-3">
              コピー
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**所要時間**: 1-2日  
**ビジネス価値**: ⭐⭐⭐⭐

---

## 📅 推奨開発スケジュール

### Week 1 (最優先)
- **配置シミュレーション実装**
  - Day 1-2: Before/After表示、Big Five変化計算
  - Day 3: バランス指数実装
  - Day 4: 影響分析ロジック
  - Day 5: UI調整・テスト

### Week 2
- **LLM統合**
  - Day 1-2: OpenAI API統合
  - Day 3: プロンプト設計
  - Day 4-5: UI実装・テスト

### Week 3
- **チーム分析強化**
  - スキル分布チャート
  - バランス指数表示
  - メンバー構成

### Week 4以降
- バックエンドAPI
- PostgreSQL統合
- 認証機能
- 保存・共有機能

---

## ✨ まとめ

### 現状
- 基本的なFitスコア計算と可視化は**完成**
- 組織図ビューで「組織をパターンで見る」は**実現**
- 候補者×全チームの適合性分析は**実現**

### 次のステップ
- **配置シミュレーション**を実装すれば、  
  「この人とこのチームの化学反応」が見える  
  → **ユーザーの『考え方の単位』が変わる瞬間を実現！**

---

**配置シミュレーションの実装を推奨します！** 🚀

---

**作成日**: 2025年10月26日  
**分析者**: AI Development Team

