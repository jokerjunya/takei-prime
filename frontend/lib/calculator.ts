/**
 * Fitスコア計算ロジック（フロントエンド版）
 * 
 * バックエンドのfit_score_calculator.pyと同じロジックをTypeScriptで実装
 */

import type {
  Candidate,
  Team,
  FitScoreResult,
  PreferenceMode,
  PreferenceWeights,
  Strength,
  Risk,
  Recommendation
} from './types'
import { PREFERENCE_MODES } from './types'
import { getSkillName } from './data'

// ========================================
// ユーティリティ関数
// ========================================

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0
  return dotProduct / (magnitudeA * magnitudeB)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ========================================
// SkillMatch計算
// ========================================

function calculateSkillMatch(candidate: Candidate, team: Team): number {
  const { requirements } = team
  
  // 1. 必須スキルチェック
  const mandatoryReqs = requirements.filter(req => req.is_mandatory)
  for (const req of mandatoryReqs) {
    const candidateSkill = candidate.skills.find(s => s.skill_id === req.skill_id)
    if (!candidateSkill || candidateSkill.proficiency_level < req.required_level) {
      return 0 // 必須スキル不足
    }
  }
  
  // 2. スキルレベルマッチング
  const scores: number[] = []
  
  for (const req of requirements) {
    const candidateSkill = candidate.skills.find(s => s.skill_id === req.skill_id)
    
    if (candidateSkill) {
      // レベル差スコア
      const levelDiff = candidateSkill.proficiency_level - req.required_level
      let levelScore: number
      
      if (levelDiff >= 0) {
        levelScore = Math.min(90 + levelDiff * 5, 100)
      } else {
        levelScore = Math.max(0, 70 + levelDiff * 20)
      }
      
      // 経験年数ボーナス
      const expBonus = Math.min(candidateSkill.years_of_experience / 5.0, 1.0) * 10
      
      const totalScore = levelScore + expBonus
      
      // 優先度による重み
      const priorityWeight = req.priority === 1 ? 1.0 : req.priority === 2 ? 0.7 : 0.5
      scores.push(totalScore * priorityWeight)
    } else {
      scores.push(0)
    }
  }
  
  // 3. 加重平均
  if (scores.length === 0) return 0
  return scores.reduce((sum, s) => sum + s, 0) / scores.length
}

// ========================================
// Retention計算
// ========================================

function calculateRetention(candidate: Candidate, team: Team): number {
  const { personality_profile: candidatePersonality } = candidate
  const { culture_profile: teamCulture, workload_average } = team
  
  // 1. 性格類似度（Big Five）
  const candidateVec = [
    candidatePersonality.openness,
    candidatePersonality.conscientiousness,
    candidatePersonality.extraversion,
    candidatePersonality.agreeableness,
    candidatePersonality.neuroticism
  ]
  
  const teamVec = [
    teamCulture.openness,
    teamCulture.conscientiousness,
    teamCulture.extraversion,
    teamCulture.agreeableness,
    teamCulture.neuroticism
  ]
  
  const similarity = cosineSimilarity(candidateVec, teamVec)
  const personalitySim = (similarity + 1) * 50 // [-1,1] → [0,100]
  
  // 2. マネージャー類似度（デモでは50固定）
  const mgrSim = 50
  
  // 3. 稼働率リスク
  let workloadRisk: number
  if (workload_average < 60) {
    workloadRisk = 0
  } else if (workload_average < 80) {
    workloadRisk = (workload_average - 60) * 1.5
  } else {
    workloadRisk = 30 + (workload_average - 80) * 3.5
  }
  
  // 4. 異動直後リスク（デモでは0固定）
  const recentMoveRisk = 0
  
  // 総合計算
  const retention = (
    0.4 * personalitySim +
    0.2 * mgrSim +
    0.2 * (100 - workloadRisk) +
    0.2 * (100 - recentMoveRisk)
  )
  
  return retention
}

// ========================================
// Friction計算
// ========================================

function calculateFriction(candidate: Candidate, team: Team): number {
  // 1. 異動回数スコア（デモでは0固定）
  const moveScore = 0
  
  // 2. 引き継ぎ負荷（デモでは20固定）
  const handoverScore = 20
  
  // 3. 上司交代スコア（デモでは0固定）
  const managerChangeScore = 0
  
  // 4. 性格摩擦（100 - 類似度）
  const candidateVec = [
    candidate.personality_profile.openness,
    candidate.personality_profile.conscientiousness,
    candidate.personality_profile.extraversion,
    candidate.personality_profile.agreeableness,
    candidate.personality_profile.neuroticism
  ]
  
  const teamVec = [
    team.culture_profile.openness,
    team.culture_profile.conscientiousness,
    team.culture_profile.extraversion,
    team.culture_profile.agreeableness,
    team.culture_profile.neuroticism
  ]
  
  const similarity = cosineSimilarity(candidateVec, teamVec)
  const personalitySim = (similarity + 1) * 50
  const personalityFriction = 100 - personalitySim
  
  // 総合計算
  const friction = (
    0.35 * moveScore +
    0.25 * handoverScore +
    0.2 * managerChangeScore +
    0.2 * personalityFriction
  )
  
  return friction
}

// ========================================
// 強み・リスク・対策生成
// ========================================

async function generateStrengths(
  skillMatch: number,
  retention: number,
  candidate: Candidate,
  team: Team
): Promise<Strength[]> {
  const strengths: Strength[] = []
  
  if (skillMatch >= 80) {
    // 上位スキルを取得
    const topSkills = candidate.skills
      .filter(cs => {
        const req = team.requirements.find(r => r.skill_id === cs.skill_id)
        return req && cs.proficiency_level >= req.required_level
      })
      .slice(0, 2)
    
    for (const skill of topSkills) {
      const skillName = await getSkillName(skill.skill_id)
      strengths.push({
        aspect: `${skillName}スキル`,
        score: 90,
        description: `${skillName}の高いスキルレベル（Lv${skill.proficiency_level}）がチームの課題解決に貢献`
      })
    }
  }
  
  if (retention >= 80) {
    strengths.push({
      aspect: 'チーム文化適合性',
      score: 85,
      description: 'チームの文化・価値観に合う性格特性を持ち、長期的に定着しやすい'
    })
  }
  
  return strengths
}

async function generateRisks(
  skillMatch: number,
  friction: number,
  candidate: Candidate,
  team: Team
): Promise<Risk[]> {
  const risks: Risk[] = []
  
  if (skillMatch < 60) {
    // 不足スキルを取得
    const missingSkills = team.requirements
      .filter(req => {
        const cs = candidate.skills.find(s => s.skill_id === req.skill_id)
        return !cs || cs.proficiency_level < req.required_level
      })
      .slice(0, 2)
    
    for (const req of missingSkills) {
      const skillName = await getSkillName(req.skill_id)
      risks.push({
        aspect: `${skillName}スキル不足`,
        score: 60,
        description: `${skillName}のスキルレベルが要求水準に達していない可能性`
      })
    }
  }
  
  if (friction > 40) {
    risks.push({
      aspect: '配置時の摩擦',
      score: 50,
      description: '配置初期にコミュニケーションや業務引き継ぎで摩擦が生じる可能性'
    })
  }
  
  return risks
}

function generateRecommendations(
  retention: number,
  friction: number,
  team: Team
): Recommendation[] {
  const recommendations: Recommendation[] = []
  
  if (retention < 70) {
    recommendations.push({
      action: '週次1on1でコミュニケーション機会を確保',
      priority: 'high',
      expected_impact: '定着率15%向上'
    })
  }
  
  if (friction > 30) {
    recommendations.push({
      action: 'オンボーディングプログラムの実施',
      priority: 'high',
      expected_impact: '立ち上がり期間30%短縮'
    })
  }
  
  if (team.workload_average > 80) {
    recommendations.push({
      action: '業務量の調整・分散',
      priority: 'medium',
      expected_impact: 'バーンアウトリスク50%軽減'
    })
  }
  
  return recommendations
}

// ========================================
// メイン計算関数
// ========================================

export async function calculateFitScore(
  candidate: Candidate,
  team: Team,
  preferenceMode: PreferenceMode = 'stability'
): Promise<FitScoreResult> {
  // 各スコア計算
  const skillMatch = calculateSkillMatch(candidate, team)
  const retention = calculateRetention(candidate, team)
  const friction = calculateFriction(candidate, team)
  
  // 重み取得
  const config = PREFERENCE_MODES[preferenceMode]
  const { alpha, beta, gamma } = config.weights
  
  // 総合スコア計算
  const totalScore = clamp(
    alpha * skillMatch + beta * retention - gamma * friction,
    0,
    100
  )
  
  // 信頼度計算
  const confidence = calculateConfidence(candidate, team)
  
  // 強み・リスク・対策生成
  const strengths = await generateStrengths(skillMatch, retention, candidate, team)
  const risks = await generateRisks(skillMatch, friction, candidate, team)
  const recommendations = generateRecommendations(retention, friction, team)
  
  return {
    total_score: Math.round(totalScore * 10) / 10,
    breakdown: {
      skill_match: Math.round(skillMatch * 10) / 10,
      retention: Math.round(retention * 10) / 10,
      friction: Math.round(friction * 10) / 10
    },
    confidence: Math.round(confidence * 100) / 100,
    strengths,
    risks,
    recommendations,
    candidate,
    team,
    preference_mode: preferenceMode,
    calculated_at: new Date().toISOString()
  }
}

function calculateConfidence(candidate: Candidate, team: Team): number {
  const factors: number[] = []
  
  // スキルデータ充実度
  if (candidate.skills.length >= 5) {
    factors.push(1.0)
  } else if (candidate.skills.length >= 3) {
    factors.push(0.8)
  } else {
    factors.push(0.5)
  }
  
  // チーム要求の明確さ
  if (team.requirements.length >= 5) {
    factors.push(1.0)
  } else if (team.requirements.length >= 3) {
    factors.push(0.8)
  } else {
    factors.push(0.6)
  }
  
  // 性格データの有無
  factors.push(1.0)
  
  return factors.reduce((sum, f) => sum + f, 0) / factors.length
}


