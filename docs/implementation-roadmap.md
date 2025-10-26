# Takei-prime 実装ロードマップ

**更新日**: 2025年10月26日  
**現在地**: Phase 1 完了 → Phase 2 着手

---

## 🗺️ 全体マップ

```
Phase 1 (完了✅)          Phase 2 (次🔴)           Phase 3 (予定🟡)
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ MVP         │         │ ホーム      │         │ 分析強化    │
│ ・計算画面   │────────▶│ ・ダッシュ  │────────▶│ ・シミュレ  │
│ ・結果表示   │         │ ・ナビゲ    │         │ ・候補者一覧│
└─────────────┘         └─────────────┘         └─────────────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │ Phase 4 (将来🟢)│
                                                 │ ・共有機能   │
                                                 │ ・LLM統合   │
                                                 └─────────────┘
```

---

## ✅ Phase 1: MVP（完了）

### 実装内容
- [x] Fitスコア表示画面（`/fit-score/result`）
- [x] 計算画面（`/calculator`）
- [x] Preferenceモード切り替え（5モード）
- [x] デモデータ（候補者10人、チーム10チーム）
- [x] 計算エンジン（TypeScript実装）

### 成果
- 24ファイル作成
- コア体験の実装完了
- フィードバック取得可能な状態

**完了日**: 2025年10月26日

---

## 🔴 Phase 2: ホーム＆ナビゲーション（次の実装）

### 目標
「組織全体を一目で把握できるダッシュボード」の実装

### 実装スコープ

#### 2-1. サイドバーナビゲーション（Week 1, Day 1-2）
**ファイル**: `components/layout/Sidebar.tsx`

**構成**:
```typescript
<Sidebar>
  <Logo />
  <NavItems>
    - 🏠 ホーム
    - 👥 候補者
    - 🏢 チーム
    - 🎯 配置シミュレーション
    - 📊 レポート
    - ⚙️ 設定
  </NavItems>
  <UserProfile />
</Sidebar>
```

**機能**:
- アクティブページのハイライト
- アイコン+テキスト
- 折りたたみ可能

**優先度**: 🔴 高  
**所要時間**: 0.5日

---

#### 2-2. ヘッダー（Week 1, Day 1-2）
**ファイル**: `components/layout/Header.tsx`

**構成**:
```typescript
<Header>
  <OrgInfo>Demo Company – 6 Teams / 350 Employees</OrgInfo>
  <SearchBar />
  <Notifications />
  <UserMenu />
</Header>
```

**優先度**: 🔴 高  
**所要時間**: 0.5日

---

#### 2-3. ホーム画面 - チーム全体ビュー（Week 1, Day 3-5）
**ファイル**: `app/dashboard/page.tsx`

**画面構成**:
```typescript
<Dashboard>
  <StatsCards>
    - 総チーム数: 10
    - 総候補者数: 50
    - 平均Fitスコア: 75.2
    - 配置提案数: 23
  </StatsCards>
  
  <TeamGrid>
    {teams.map(team => (
      <TeamCard
        name={team.name}
        type="成果重視型"
        avgFit={82}
        culture="挑戦志向"
        strength="行動力"
        risk="短期離職の傾向"
      />
    ))}
  </TeamGrid>
</Dashboard>
```

**TeamCardコンポーネント**:
```tsx
<Card>
  <CardHeader>
    <h3>営業第一部</h3>
    <Badge>成果重視型</Badge>
  </CardHeader>
  <CardContent>
    <div className="text-4xl font-bold">82</div>
    <p className="text-sm text-muted">平均Fitスコア</p>
    
    <Separator />
    
    <dl>
      <dt>文化</dt>
      <dd>挑戦志向</dd>
      
      <dt>強み</dt>
      <dd>行動力</dd>
      
      <dt>リスク</dt>
      <dd className="text-amber-600">短期離職の傾向</dd>
    </dl>
    
    <Button variant="outline" size="sm">
      詳細を見る →
    </Button>
  </CardContent>
</Card>
```

**優先度**: 🔴 高  
**所要時間**: 3日

---

#### 2-4. チーム詳細画面（Week 2, Day 1-3）
**ファイル**: `app/teams/[id]/page.tsx`

**画面構成**:
```typescript
<TeamDetail>
  <TeamHeader>
    <h1>{team.name}</h1>
    <Badge>{team.department}</Badge>
  </TeamHeader>
  
  <Grid cols={3}>
    <TeamStats>
      - メンバー数: 8人
      - 平均年齢: 32歳
      - 平均経験年数: 5.2年
    </TeamStats>
    
    <CultureProfile>
      <RadarChart data={team.culture_profile} />
    </CultureProfile>
    
    <RequiredSkills>
      {team.requirements.map(req => (
        <SkillBadge skill={req} />
      ))}
    </RequiredSkills>
  </Grid>
  
  <RecommendedCandidates>
    <h2>おすすめ候補者</h2>
    <CandidateList teamId={team.id} />
  </RecommendedCandidates>
</TeamDetail>
```

**優先度**: 🟡 中  
**所要時間**: 2日

---

#### 2-5. レイアウト統合（Week 2, Day 4-5）
**ファイル**: `app/layout.tsx` 更新

**構成**:
```tsx
<html>
  <body>
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  </body>
</html>
```

**優先度**: 🔴 高  
**所要時間**: 1日

---

### Phase 2 成果物
- [ ] サイドバーナビゲーション
- [ ] ヘッダー（組織情報、検索、通知）
- [ ] ホーム画面（チームカード一覧）
- [ ] チーム詳細画面
- [ ] レイアウト統合

**期間**: 2週間（10営業日）  
**新規ファイル数**: 約8ファイル

---

## 🟡 Phase 3: 分析＆シミュレーション

### 実装スコープ

#### 3-1. 候補者一覧画面（Week 3, Day 1-3）
**ファイル**: `app/candidates/page.tsx`

**画面構成**:
```typescript
<CandidatesPage>
  <PageHeader>
    <h1>候補者一覧</h1>
    <Button>候補者を追加</Button>
  </PageHeader>
  
  <Filters>
    - スキルフィルター
    - 経験年数フィルター
    - Fitスコア範囲
  </Filters>
  
  <CandidateTable>
    {candidates.map(candidate => (
      <CandidateRow>
        <CandidateInfo />
        <FitScoreBarChart teams={teams} />
        <AIInsight />
        <ActionButton />
      </CandidateRow>
    ))}
  </CandidateTable>
</CandidatesPage>
```

**FitScoreBarChart**:
```tsx
<div className="flex gap-1">
  {teams.map(team => (
    <div key={team.id} className="flex-1">
      <div className="h-8 bg-gray-200 rounded">
        <div 
          className="h-full bg-violet-600 rounded"
          style={{ width: `${fitScore}%` }}
        />
      </div>
      <p className="text-xs text-center mt-1">
        {team.name.slice(0, 8)}...
      </p>
      <p className="text-xs text-center font-bold">
        {fitScore}
      </p>
    </div>
  ))}
</div>
```

**優先度**: 🟡 中  
**所要時間**: 3日

---

#### 3-2. 配置シミュレーション画面（Week 4-5）
**ファイル**: `app/simulation/page.tsx`

**画面構成**:
```typescript
<SimulationPage>
  <SelectionPanel>
    <CandidateSelector />
    <TeamSelector />
    <Button onClick={runSimulation}>
      シミュレーション実行
    </Button>
  </SelectionPanel>
  
  <SplitView>
    <BeforePanel>
      <h2>現在のチーム構成</h2>
      <TeamComposition team={currentTeam} />
      <CultureChart data={currentCulture} />
    </BeforePanel>
    
    <AfterPanel>
      <h2>配置後のシミュレーション</h2>
      <TeamComposition team={simulatedTeam} />
      <CultureChart 
        data={simulatedCulture}
        showDiff={true}
      />
      <AIInsights>
        <Strengths />
        <Risks />
        <Actions />
      </AIInsights>
    </AfterPanel>
  </SplitView>
</SimulationPage>
```

**優先度**: 🟡 中  
**所要時間**: 5日

---

#### 3-3. チーム分析タブ（Week 6）
**ファイル**: `app/teams/[id]/analysis/page.tsx`

**画面構成**:
```typescript
<TeamAnalysisPage>
  <BalanceIndex score={72} />
  
  <Grid cols={2}>
    <BigFiveChart team={team} />
    <SkillDistribution team={team} />
  </Grid>
  
  <InteractiveSimulation>
    <CandidateAddSimulator />
  </InteractiveSimulation>
</TeamAnalysisPage>
```

**優先度**: 🟢 低  
**所要時間**: 3日

---

### Phase 3 成果物
- [ ] 候補者一覧（Fitスコア棒グラフ）
- [ ] 配置シミュレーション（Before/After）
- [ ] チーム分析（Big Five、バランス指数）

**期間**: 4週間  
**新規ファイル数**: 約10ファイル

---

## 🟢 Phase 4: コラボレーション＆自動化

### 実装スコープ

#### 4-1. 提案保存・履歴管理
- 提案の保存機能
- 履歴一覧
- ステータス管理（決定/保留/再検討）

#### 4-2. 候補者訴求生成（LLM統合）
- OpenAI API統合
- プロンプトエンジニアリング
- 訴求メッセージ生成

#### 4-3. 共有機能
- Slack連携
- メール送信
- チーム共有

#### 4-4. 自動更新通知
- 候補者状態変化の検出
- 代替候補の推薦
- ダッシュボード通知

**期間**: 3週間  
**優先度**: 🟢 低（機能拡張フェーズ）

---

## 📅 タイムライン

```
2025年10月26日 (今日)
├─ Phase 1 完了 ✅
│
2025年11月 (Week 1-2)
├─ Phase 2-1: ナビゲーション
├─ Phase 2-2: ヘッダー
├─ Phase 2-3: ホーム画面
├─ Phase 2-4: チーム詳細
└─ Phase 2-5: レイアウト統合
│
2025年11月 (Week 3-6)
├─ Phase 3-1: 候補者一覧
├─ Phase 3-2: 配置シミュレーション
└─ Phase 3-3: チーム分析
│
2025年12月 (Week 7-9)
└─ Phase 4: コラボレーション機能
```

---

## 🎯 次のアクション（明日から）

### 優先度1: サイドバー＋ヘッダー（1日）
```bash
# 新規作成
components/layout/Sidebar.tsx
components/layout/Header.tsx

# 更新
app/layout.tsx
```

### 優先度2: ホーム画面（3日）
```bash
# 新規作成
app/dashboard/page.tsx
components/team/TeamCard.tsx
components/team/TeamGrid.tsx
```

### 優先度3: チーム詳細（2日）
```bash
# 新規作成
app/teams/[id]/page.tsx
components/team/TeamDetail.tsx
components/team/CultureProfile.tsx
```

---

**策定者**: Development Team  
**承認**: (記入)  
**最終更新**: 2025年10月26日

