/**
 * 配置シミュレーション - チーム構成の変化を計算
 */

import type { Candidate, Team, PersonalityProfile } from './types'

// ========================================
// 型定義
// ========================================

export interface SimulationResult {
  before: {
    culture: PersonalityProfile
    balance_index: number
    member_count: number
  }
  after: {
    culture: PersonalityProfile
    balance_index: number
    member_count: number
  }
  diff: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
    balance_index: number
  }
  impact_analysis: {
    strengths: string[]
    risks: string[]
    recommendations: string[]
    retention_estimate: number  // 定着率予測（%）
  }
}

// ========================================
// Big Five 変化計算
// ========================================

/**
 * 候補者追加後のチーム文化を計算
 */
export function simulateTeamWithCandidate(
  team: Team,
  candidate: Candidate
): SimulationResult {
  const currentSize = team.size
  const newSize = currentSize + 1

  // Before: 現在のチーム平均（team.culture_profileを使用）
  const before = {
    culture: team.culture_profile,
    balance_index: calculateBalanceIndex(team.culture_profile, team.size),
    member_count: currentSize
  }

  // After: 候補者追加後の平均
  const afterCulture: PersonalityProfile = {
    openness: calculateNewAverage(
      team.culture_profile.openness,
      currentSize,
      candidate.personality_profile.openness
    ),
    conscientiousness: calculateNewAverage(
      team.culture_profile.conscientiousness,
      currentSize,
      candidate.personality_profile.conscientiousness
    ),
    extraversion: calculateNewAverage(
      team.culture_profile.extraversion,
      currentSize,
      candidate.personality_profile.extraversion
    ),
    agreeableness: calculateNewAverage(
      team.culture_profile.agreeableness,
      currentSize,
      candidate.personality_profile.agreeableness
    ),
    neuroticism: calculateNewAverage(
      team.culture_profile.neuroticism,
      currentSize,
      candidate.personality_profile.neuroticism
    ),
    // variance は簡易的に既存値を使用（本来は再計算が必要）
    openness_variance: team.culture_profile.openness_variance,
    conscientiousness_variance: team.culture_profile.conscientiousness_variance,
    extraversion_variance: team.culture_profile.extraversion_variance,
    agreeableness_variance: team.culture_profile.agreeableness_variance,
    neuroticism_variance: team.culture_profile.neuroticism_variance
  }

  const after = {
    culture: afterCulture,
    balance_index: calculateBalanceIndexAfterAddition(
      team.culture_profile,
      candidate.personality_profile,
      currentSize
    ),
    member_count: newSize
  }

  // Diff: 変化量
  const diff = {
    openness: afterCulture.openness - before.culture.openness,
    conscientiousness: afterCulture.conscientiousness - before.culture.conscientiousness,
    extraversion: afterCulture.extraversion - before.culture.extraversion,
    agreeableness: afterCulture.agreeableness - before.culture.agreeableness,
    neuroticism: afterCulture.neuroticism - before.culture.neuroticism,
    balance_index: after.balance_index - before.balance_index
  }

  // Impact Analysis
  const impact_analysis = analyzeImpact(before.culture, afterCulture, diff, team, candidate)

  return {
    before,
    after,
    diff,
    impact_analysis
  }
}

// ========================================
// ヘルパー関数
// ========================================

/**
 * 新しい平均値を計算
 */
function calculateNewAverage(
  currentAvg: number,
  currentSize: number,
  newValue: number
): number {
  return (currentAvg * currentSize + newValue) / (currentSize + 1)
}

/**
 * バランス指数を計算（簡易版）
 * 
 * チームの各性格次元の分散（variance）から多様性を評価
 * 分散が適度にある（10-20程度）場合にバランスが良いと判定
 */
function calculateBalanceIndex(
  culture: PersonalityProfile & {
    openness_variance: number
    conscientiousness_variance: number
    extraversion_variance: number
    agreeableness_variance: number
    neuroticism_variance: number
  },
  teamSize: number
): number {
  const variances = [
    culture.openness_variance,
    culture.conscientiousness_variance,
    culture.extraversion_variance,
    culture.agreeableness_variance,
    culture.neuroticism_variance
  ]

  const avgVariance = variances.reduce((sum, v) => sum + v, 0) / variances.length

  // 最適な分散は12-18程度
  // 分散が小さすぎる（<10）= 画一的
  // 分散が大きすぎる（>25）= バラバラ
  let balance: number

  if (avgVariance < 10) {
    // 画一的 → バランス指数低下
    balance = 50 + avgVariance * 3
  } else if (avgVariance <= 18) {
    // 適度な多様性 → バランス指数高い
    balance = 70 + (18 - Math.abs(avgVariance - 15)) * 2
  } else {
    // バラバラ → バランス指数低下
    balance = 80 - (avgVariance - 18) * 2
  }

  return Math.max(0, Math.min(100, balance))
}

/**
 * 候補者追加後のバランス指数を計算（簡易版）
 */
function calculateBalanceIndexAfterAddition(
  teamCulture: PersonalityProfile,
  candidatePersonality: PersonalityProfile,
  currentSize: number
): number {
  // 簡易的に、候補者がチーム平均からどれだけ離れているかで判定
  const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const
  
  const distances = dimensions.map(dim => 
    Math.abs(candidatePersonality[dim] - teamCulture[dim])
  )
  
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length

  // 距離が大きい → 多様性増加 → バランス変化
  // 適度な距離（10-20）が理想
  let newBalance: number
  
  if (avgDistance < 10) {
    // 似ている → 多様性減少
    newBalance = 65
  } else if (avgDistance <= 20) {
    // 適度に異なる → バランス良好
    newBalance = 75
  } else {
    // 大きく異なる → バランス崩れる可能性
    newBalance = 60 - (avgDistance - 20)
  }

  return Math.max(0, Math.min(100, newBalance))
}

// ========================================
// 影響分析
// ========================================

/**
 * 候補者追加の影響を分析
 */
function analyzeImpact(
  before: PersonalityProfile,
  after: PersonalityProfile,
  diff: Record<string, number>,
  team: Team,
  candidate: Candidate
): {
  strengths: string[]
  risks: string[]
  recommendations: string[]
  retention_estimate: number
} {
  const strengths: string[] = []
  const risks: string[] = []
  const recommendations: string[] = []

  // ========== 強み分析 ==========

  // 開放性の増加 → イノベーション
  if (diff.openness > 3) {
    strengths.push('新しいアイデアや視点が加わり、イノベーションが促進される')
  }

  // 誠実性の増加 → 信頼性向上
  if (diff.conscientiousness > 3) {
    strengths.push('計画性・実行力が強化され、プロジェクトの完遂率が向上')
  }

  // 外向性の増加 → コミュニケーション活性化
  if (diff.extraversion > 3) {
    strengths.push('チームのコミュニケーションが活発化し、情報共有が促進される')
  }

  // 協調性の増加 → チーム調和
  if (diff.agreeableness > 3) {
    strengths.push('協力的な雰囲気が強まり、チームの一体感が向上')
  }

  // 情緒安定性の増加（neuroticism減少） → ストレス耐性
  if (diff.neuroticism < -3) {
    strengths.push('チーム全体のストレス耐性が向上し、安定的に成果を出せる')
  }

  // ========== リスク分析 ==========

  // 外向性の減少 → コミュニケーション減少
  if (diff.extraversion < -3) {
    risks.push('チームのコミュニケーション頻度が減少する可能性')
  }

  // 誠実性の減少 → 計画性低下
  if (diff.conscientiousness < -3) {
    risks.push('計画性や締め切り遵守に課題が生じる可能性')
  }

  // バランス指数の大幅変化
  if (Math.abs(diff.balance_index) > 10) {
    risks.push(`チームバランスが変化（${diff.balance_index > 0 ? '+' : ''}${diff.balance_index.toFixed(1)}pt）`)
  }

  // 高稼働率チームへの追加
  if (team.workload_average > 80) {
    risks.push('既に高稼働率のため、オンボーディングリソースが不足する可能性')
  }

  // ========== 推奨アクション ==========

  // 外向性が低い候補者 → コミュニケーション支援
  if (candidate.personality_profile.extraversion < 50) {
    recommendations.push('週次1on1で発言機会を確保し、心理的安全性を高める')
  }

  // コミュニケーションギャップリスク
  if (diff.extraversion < -3) {
    recommendations.push('チームミーティングの頻度を増やし、積極的な情報共有を促す')
  }

  // 高稼働率への対策
  if (team.workload_average > 80) {
    recommendations.push('オンボーディング専任メンターをアサインし、業務移管を計画的に行う')
  }

  // 文化の大きな変化
  if (Math.abs(diff.openness) > 5 || Math.abs(diff.conscientiousness) > 5) {
    recommendations.push('最初の3ヶ月は定期的なフィードバックセッションを実施')
  }

  // デフォルト推奨
  if (recommendations.length === 0) {
    recommendations.push('標準的なオンボーディングプログラムで十分対応可能')
  }

  // ========== 定着率予測 ==========

  let retentionEstimate = 80  // ベースライン

  // ポジティブ要因
  if (diff.agreeableness > 3) retentionEstimate += 5
  if (diff.neuroticism < -3) retentionEstimate += 5
  if (Math.abs(diff.balance_index) < 5) retentionEstimate += 5

  // ネガティブ要因
  if (diff.extraversion < -5) retentionEstimate -= 10
  if (team.workload_average > 85) retentionEstimate -= 10
  if (Math.abs(diff.balance_index) > 15) retentionEstimate -= 5

  retentionEstimate = Math.max(40, Math.min(95, retentionEstimate))

  return {
    strengths,
    risks,
    recommendations,
    retention_estimate: retentionEstimate
  }
}

// ========================================
// ユーティリティ
// ========================================

/**
 * 標準偏差を計算
 */
function calculateStdDev(values: number[]): number {
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2))
  const variance = squaredDiffs.reduce((sum, sd) => sum + sd, 0) / values.length
  return Math.sqrt(variance)
}

