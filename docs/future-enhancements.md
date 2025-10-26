# 今後の開発課題・機能拡張

**作成日**: 2025年10月26日

---

## 🔴 Priority: High（重要な設計課題）

### 1. 候補者の応募職種フィルタリング ⭐⭐⭐⭐⭐

**課題**:
> エンジニア候補者に人事チームとのFitスコアを表示しても意味がない。  
> 候補者は特定の職種・ポジションで応募しているはず。

**現状の問題**:
- 全候補者 × 全43チームのFitスコアを計算・表示
- 関係のないチーム（エンジニア→人事、営業→開発等）も表示される
- 意味のない比較が混在する

**必要な機能**:

#### データ側
```typescript
interface Candidate {
  // 既存のフィールド
  ...
  
  // 新規追加
  target_role: 'engineer' | 'sales' | 'marketing' | 'design' | 'corporate' | 'operations'
  target_teams?: string[]  // 応募チームIDの配列（任意）
  target_departments?: string[]  // 応募部署IDの配列（任意）
}

interface Team {
  // 既存のフィールド
  ...
  
  // 新規追加
  recruiting_positions: Array<{
    role: string  // 'engineer', 'sales', etc
    level: 'junior' | 'mid' | 'senior' | 'lead'
    count: number  // 募集人数
  }>
}
```

#### ロジック側
```typescript
function getRelevantTeamsForCandidate(
  candidate: Candidate,
  allTeams: Team[]
): Team[] {
  // 1. 候補者が応募しているチームが明示されている場合
  if (candidate.target_teams && candidate.target_teams.length > 0) {
    return allTeams.filter(t => candidate.target_teams!.includes(t.id))
  }
  
  // 2. 応募職種に基づいてフィルタリング
  return allTeams.filter(team => 
    team.recruiting_positions.some(pos => 
      pos.role === candidate.target_role
    )
  )
}
```

#### UI側
```typescript
// 候補者一覧で表示するFitスコアは関連チームのみ
const relevantTeams = getRelevantTeamsForCandidate(candidate, allTeams)
const relevantScores = relevantTeams.map(team => ({
  team,
  score: calculateFitScore(candidate, team)
}))

// 棒グラフに表示
<FitScoreBarChart scores={relevantScores} />
```

**実装箇所**:
- データモデル更新
- フィルタリングロジック追加
- 候補者一覧ページ更新
- 候補者詳細ページ更新

**所要時間**: 1-2日

**ビジネス価値Menu⭐⭐⭐⭐⭐（非常に重要）

---

## 🟡 Priority: Medium

### 2. 募集ポジション管理

**機能**:
- チームごとの募集ポジション設定
- 募集人数の管理
- ステajiス管理（募集中/充足/停止）

**データ構造**:
```typescript
interface RecruitingPosition {
  id: string
  team_id: string
  role: string
  level: 'junior' | 'mid' | 'senior' | 'lead'
  required_count: number
  filled_count: number
  status: 'open' | 'filled' | 'closed'
  created_at: string
  deadline?: string
}
```

**UI**:
- チーム詳細ページに「募集ポジション」セクション
- ポジション別の候補者推薦
- 充足状況の可視化

**所要時間**: 2-3日

---

### 3. 職種別カテゴリ管理

**機能**:
- 職種マスターデータ
- 職種カテゴリ階層
- 職種間の関連性定義

**データ構造**:
```typescript
interface RoleCategory {
  id: string
  name: string
  parent_id?: string
  related_roles: string[]  // 関連職種
}

// 例
{
  id: 'engineer',
  name: 'エンジニア',
  related_roles: ['data_scientist', 'ml_engineer', 'backend_engineer']
}
```

**ロジック**:
```typescript
// エンジニア職種群で応募 → 関連する全エンジニアチームを表示
function getRelatedTeams(candidate: Candidate, allTeams: Team[]): Team[] {
  const roleCategory = getRoleCategory(candidate.target_role)
  const relatedRoles = [candidate.target_role, ...roleCategory.related_roles]
  
  return allTeams.filter(team =>
    team.recruiting_positions.some(pos =>
      relatedRoles.includes(pos.role)
    )
  )
}
```

**所要時間Menu 1-2日

---

### 4. スキルベースのチーム推薦

**機能**:
- 候補者のスキルセットから関連チームを自動推薦
- スキルマッチ度順にソート
- 「想定外のマッチ」の発見

**ロジック**:
```typescript
// スキルの重なりが大きいチームを推薦
function recommendTeamsBySkill(
  candidate: Candidate,
  allTeams: Team[]
): Team[] {
  return allTeams
    .map(team => ({
      team,
      skillOverlap: calculateSkillOverlap(candidate.skills, team.requirements)
    }))
    .filter(t => t.skillOverlap > 0.3)  // 30%以上の重なり
    .sort((a, b) => b.skillOverlap - a.skillOverlap)
    .map(t => t.team)
}
```

**所要時間**: 1日

---

## 🟢 Priority: Low

### 5. キャリアパス推薦

**機能**:
- 候補者の現在職種 → 次のキャリアステップ推薦
- 「データアナリスト → データサイエンティスト」
- 「ジュニアエンジニア → シニアエンジニア」

### 6. 部署間異動の推薦

**機能**:
- 社内人材の部署間異動シミュレーション
- キャリア開発の提案

---

## 📝 実装の記録

### 記録日: 2025年10月26日

**ユーザーからのフィードバック**:
> 「候補者は受けている求人があるわけだから、  
> 関係ないチームへのfit度は意味ないのでは？  
> エンジニアの人は人事チームとかには行かないわけだし」

**対応方針**:
1. ✅ 課題を future-enhancements.md に記録
2. ⏳ まず配置シミュレーションを実装
3. ⏳ その後、応募職種フィルタリングを実装

**優先順位**:
1. 配置シミュレーション（最優先）
2. 応募職種フィルタリング（次に重要）
3. 候補者訴求生成（その次）

---

**Last UpdatedMenu 2025年10月26日

